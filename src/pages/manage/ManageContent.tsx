import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import ManageLayout from "@/components/manage/ManageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { StateToggleButton } from "@/components/ui/state-toggle-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Copy, ArrowLeft, Pencil, Plus, Trash2, X, Check, ImagePlus, Save, CalendarIcon, Search, RotateCcw, ChevronDown, ListPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateCode } from "@/lib/utils";
import { getContentTypeLabel } from "@/lib/contentTypeConstants";
import { type DrawMode, drawModeMeta } from "@/components/manage/draw-mode";
import ModeChangeWarningModal from "@/components/manage/ModeChangeWarningModal";
import {
  getManageContentDetail,
  updateManageContent,
  deleteManageContent,
  getManageRewardsByContent,
  createManageReward,
  updateManageReward,
  deleteManageReward,
  updateManageRewards,
  deleteAllManageRewardsByContent,
  getManageInvitationCodesByContent,
  createManageInvitationCode,
  updateManageInvitationCode,
  deleteManageInvitationCode,
  importParticipantCodesToInvitationCodes,
  getManageParticipantCodes,
  getManageDrawResults,
  updateDeliveryStatus,
} from "@/api/client";
import type { ManageContentDetailResponse, ManageRewardResponse, ManageInvitationCodeResponse, ManageDrawResultResponse, PageResponse } from "@/api/types";

type DeliveredFilter = "all" | "true" | "false";

interface AppliedFilters {
  drawnAtFrom: string;
  drawnAtTo: string;
  delivered: DeliveredFilter;
  invitationCode: string;
  rewardName: string;
}

const emptyAppliedFilters: AppliedFilters = {
  drawnAtFrom: "",
  drawnAtTo: "",
  delivered: "all",
  invitationCode: "",
  rewardName: "",
};

const PAGE_SIZE = 20;

interface RequestState<Key> {
  key: Key | null;
  settled: boolean;
  error: string | null;
}

// ── Local form types ────────────────────────────────────────────────────────

interface InvitationCodeFormState {
  code: string;
  name: string;
  allowedDrawCount: string;
  active: boolean;
}

interface PendingInvitationCodeFormState {
  id: number;
  form: InvitationCodeFormState;
  saving: boolean;
  error: string | null;
}

const emptyCodeForm = (): InvitationCodeFormState => ({
  code: "", name: "", allowedDrawCount: "", active: true,
});

const fromApiCode = (c: ManageInvitationCodeResponse): InvitationCodeFormState => ({
  code: c.code,
  name: c.name ?? "",
  allowedDrawCount: String(c.allowedDrawCount),
  active: c.active,
});

interface RewardFormState {
  name: string;
  description: string;
  weight: string;
  poolCount: string;
  stock: string;
  unlimited: boolean;
  imageUrl: string;
  allowDuplicateReward: boolean;
  active: boolean;
}

const emptyForm = (): RewardFormState => ({
  name: "", description: "", weight: "", poolCount: "", stock: "",
  unlimited: true, imageUrl: "", allowDuplicateReward: true, active: true,
});

const fromApiReward = (r: ManageRewardResponse): RewardFormState => ({
  name: r.name,
  description: r.description ?? "",
  weight: r.weight != null ? String(r.weight) : "",
  poolCount: r.poolCount != null ? String(r.poolCount) : "",
  stock: r.stock != null ? String(r.stock) : "",
  unlimited: r.stock == null,
  imageUrl: r.imageUrl ?? "",
  allowDuplicateReward: r.allowDuplicateReward,
  active: r.active,
});

const isDigitsOnly = (value: string) => /^\d*$/.test(value);

const parsePositiveInteger = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { kind: "empty" as const };
  }

  if (!/^\d+$/.test(trimmed)) {
    return { kind: "invalid" as const };
  }

  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return { kind: "nonPositive" as const };
  }

  return { kind: "valid" as const, value: parsed };
};

const parseNonNegativeInteger = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { kind: "empty" as const };
  }

  if (!/^\d+$/.test(trimmed)) {
    return { kind: "invalid" as const };
  }

  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return { kind: "negative" as const };
  }

  return { kind: "valid" as const, value: parsed };
};

const getPositiveIntegerError = (value: string, emptyMessage: string, invalidMessage: string) => {
  const parsed = parsePositiveInteger(value);
  if (parsed.kind === "empty") return emptyMessage;
  if (parsed.kind !== "valid") return invalidMessage;
  return null;
};

const getNonNegativeIntegerError = (value: string, emptyMessage: string, invalidMessage: string) => {
  const parsed = parseNonNegativeInteger(value);
  if (parsed.kind === "empty") return emptyMessage;
  if (parsed.kind !== "valid") return invalidMessage;
  return null;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = error.message;
    if (typeof message === "string") {
      return message;
    }
  }

  return fallback;
};

// ── RewardFormCard ──────────────────────────────────────────────────────────

const RewardFormCard: React.FC<{
  formId: string;
  title: string;
  form: RewardFormState;
  onChange: (f: RewardFormState) => void;
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
  error?: string | null;
  mode: DrawMode;
}> = ({ formId, title, form, onChange, onSave, onCancel, saving, error, mode }) => (
  <Card className="border border-primary/30 bg-muted/20">
    <CardContent className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <StateToggleButton
          checked={form.active}
          onCheckedChange={(v) => onChange({ ...form, active: v })}
          checkedLabel="추첨 포함"
          uncheckedLabel="추첨 제외"
          className="h-7"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm pl-1">보상 이름</Label>
        <Input placeholder="예: 교환권" value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm pl-1">설명</Label>
        <Input placeholder="보상에 대한 간단한 설명" value={form.description} onChange={(e) => onChange({ ...form, description: e.target.value })} />
      </div>
      {mode === "WEIGHTED" ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 pl-1">
              <Label className="text-sm">가중치</Label>
              <span className="text-[11px] text-muted-foreground">당첨 확률 비율에 사용되는 값</span>
            </div>
            <Input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="10"
              value={form.weight}
              onChange={(e) => {
                const value = e.target.value;
                if (!isDigitsOnly(value)) return;
                onChange({ ...form, weight: value });
              }}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 pl-1">
              <Label className="text-sm">수량</Label>
              <span className="text-[11px] text-muted-foreground">남아 있는 보상 개수</span>
            </div>
            <div className="flex items-center gap-1.5">
              <StateToggleButton
                checked={form.unlimited}
                onCheckedChange={(v) => onChange({ ...form, unlimited: v })}
                checkedLabel="무제한"
                uncheckedLabel="개수 지정"
              />
              <Input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="수량"
                value={form.stock}
                disabled={form.unlimited}
                className={`flex-1 ${form.unlimited ? "opacity-50" : ""}`}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!isDigitsOnly(value)) return;
                  onChange({ ...form, stock: value });
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 pl-1">
            <Label className="text-sm">개수</Label>
            <span className="text-[11px] text-muted-foreground">당첨 가능한 제비 수</span>
          </div>
          <Input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="5"
            value={form.poolCount}
            onChange={(e) => {
              const value = e.target.value;
              if (!isDigitsOnly(value)) return;
              onChange({ ...form, poolCount: value });
            }}
          />
        </div>
      )}
      <div className="space-y-1.5">
        <Label className="text-sm pl-1">이미지 URL</Label>
        <div className="flex gap-3 items-start">
          <div className="shrink-0 w-[56px] h-[56px] rounded-md border border-dashed border-border bg-muted flex items-center justify-center overflow-hidden">
            {form.imageUrl ? (
              <img src={form.imageUrl} alt={form.name || "보상 이미지"} className="w-full h-full object-cover" />
            ) : (
              <ImagePlus className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <Input
            className="flex-1"
            placeholder="이미지 URL을 입력하세요"
            value={form.imageUrl}
            onChange={(e) => onChange({ ...form, imageUrl: e.target.value })}
          />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2 pl-2">
          <Checkbox
            id={`dup-${formId}`}
            checked={form.allowDuplicateReward}
            onCheckedChange={(checked) => onChange({ ...form, allowDuplicateReward: !!checked })}
          />
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <Label htmlFor={`dup-${formId}`} className="text-sm cursor-pointer shrink-0">중복 당첨 허용</Label>
            <span className="text-xs text-muted-foreground">동일 사용자가 이 보상을 여러 번 당첨받을 수 있습니다.</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="gap-1" onClick={onSave} disabled={saving}>
            <Check className="h-3.5 w-3.5" /> {saving ? "저장 중..." : "저장"}
          </Button>
          <Button size="sm" variant="outline" className="gap-1" onClick={onCancel} disabled={saving}>
            <X className="h-3.5 w-3.5" /> 취소
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// ── InvitationCodeFormCard ──────────────────────────────────────────────────

const InvitationCodeFormCard: React.FC<{
  title: string;
  form: InvitationCodeFormState;
  onChange: (f: InvitationCodeFormState) => void;
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
  error?: string | null;
  isEdit?: boolean;
}> = ({ title, form, onChange, onSave, onCancel, saving, error, isEdit }) => (
  <Card className="border border-primary/30 bg-muted/20">
    <CardContent className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {isEdit && (
          <StateToggleButton
            checked={form.active}
            onCheckedChange={(v) => onChange({ ...form, active: v })}
            checkedLabel="활성화"
            uncheckedLabel="비활성화"
            className="h-7"
          />
        )}
      </div>
      {!isEdit && (
        <div className="space-y-1.5">
          <Label className="text-sm">코드</Label>
          <Input 
            className="font-mono" 
            placeholder="예: LUCKY-001" 
            value={form.code} 
            onChange={(e) => {
              const value = e.target.value;
              // 대문자, 소문자, 숫자, 하이픈(-), 언더스코어(_)만 허용
              const filteredValue = value.replace(/[^A-Za-z0-9-_]/g, "");
              onChange({ ...form, code: filteredValue });
            }} 
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm">참여자 이름</Label>
          <Input placeholder="참여자 이름" value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">허용 횟수</Label>
          <Input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="1"
            value={form.allowedDrawCount}
            onChange={(e) => {
              const value = e.target.value;
              if (!isDigitsOnly(value)) return;
              onChange({ ...form, allowedDrawCount: value });
            }}
          />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2 pt-1 justify-end">
        <Button size="sm" className="gap-1" onClick={onSave} disabled={saving}>
          <Check className="h-3.5 w-3.5" /> {saving ? "저장 중..." : "저장"}
        </Button>
        <Button size="sm" variant="outline" className="gap-1" onClick={onCancel} disabled={saving}>
          <X className="h-3.5 w-3.5" /> 취소
        </Button>
      </div>
    </CardContent>
  </Card>
);

// ── ManageContent ───────────────────────────────────────────────────────────

const ManageContent: React.FC = () => {
  const { contentCode } = useParams<{ contentCode: string }>();
  const navigate = useNavigate();

  // Content state
  const [content, setContent] = useState<ManageContentDetailResponse | null>(null);
  const [contentRequest, setContentRequest] = useState<RequestState<string>>({
    key: contentCode ?? null,
    settled: false,
    error: null,
  });
  const [copied, setCopied] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<number | null>(null);

  // Edit content state
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartAt, setEditStartAt] = useState("");
  const [editEndAt, setEditEndAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Rewards state
  const [rewards, setRewards] = useState<ManageRewardResponse[]>([]);
  const [rewardsRequest, setRewardsRequest] = useState<RequestState<string>>({
    key: null,
    settled: false,
    error: null,
  });
  const [drawMode, setDrawMode] = useState<DrawMode>("WEIGHTED");

  // Mode change modal
  const [modeChangeNextMode, setModeChangeNextMode] = useState<DrawMode | null>(null);
  const [modeChanging, setModeChanging] = useState(false);

  // Add reward form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<RewardFormState>(emptyForm());
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit reward form
  const [editingRewardId, setEditingRewardId] = useState<number | null>(null);
  const [editRewardForm, setEditRewardForm] = useState<RewardFormState>(emptyForm());
  const [editingReward, setEditingReward] = useState(false);
  const [editRewardError, setEditRewardError] = useState<string | null>(null);

  // Invitation codes state
  const [inviteCodes, setInviteCodes] = useState<ManageInvitationCodeResponse[]>([]);
  const [inviteCodesRequest, setInviteCodesRequest] = useState<RequestState<string>>({
    key: null,
    settled: false,
    error: null,
  });
  const [importingParticipantCodes, setImportingParticipantCodes] = useState(false);
  const [participantCodeImportMessage, setParticipantCodeImportMessage] = useState<string | null>(null);

  // Add invitation code forms
  const [addCodeForms, setAddCodeForms] = useState<PendingInvitationCodeFormState[]>([]);

  // Edit invitation code form
  const [editingCodeId, setEditingCodeId] = useState<number | null>(null);
  const [editCodeForm, setEditCodeForm] = useState<InvitationCodeFormState>(emptyCodeForm());
  const [editingCode, setEditingCode] = useState(false);
  const [editCodeError, setEditCodeError] = useState<string | null>(null);

  // Draw results state (Page 응답)
  const [drawResultsPage, setDrawResultsPage] = useState<PageResponse<ManageDrawResultResponse> | null>(null);
  const [drawResultsRequest, setDrawResultsRequest] = useState<RequestState<string>>({
    key: null,
    settled: false,
    error: null,
  });
  const [updatingDeliveryId, setUpdatingDeliveryId] = useState<number | null>(null);

  // Pagination
  const [page, setPage] = useState(0);

  // Pending filters (입력 중)
  const [pendingDrawnAtFrom, setPendingDrawnAtFrom] = useState<Date | null>(null);
  const [pendingDrawnAtTo, setPendingDrawnAtTo] = useState<Date | null>(null);
  const [pendingDelivered, setPendingDelivered] = useState<DeliveredFilter>("all");
  const [pendingInvitationCode, setPendingInvitationCode] = useState("");
  const [pendingRewardName, setPendingRewardName] = useState("");

  // Filter card open/close
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Applied filters (검색 클릭 시 적용)
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>(emptyAppliedFilters);

  const drawResultsRequestKey = contentCode
    ? [
        contentCode,
        page,
        appliedFilters.drawnAtFrom,
        appliedFilters.drawnAtTo,
        appliedFilters.delivered,
        appliedFilters.invitationCode,
        appliedFilters.rewardName,
      ].join("|")
    : null;

  const loading = contentCode
    ? contentRequest.key !== contentCode || !contentRequest.settled
    : false;
  const error = contentRequest.key === contentCode ? contentRequest.error : null;
  const rewardsLoading = contentCode
    ? rewardsRequest.key !== contentCode || !rewardsRequest.settled
    : false;
  const rewardsError = rewardsRequest.key === contentCode ? rewardsRequest.error : null;
  const inviteCodesLoading = contentCode
    ? inviteCodesRequest.key !== contentCode || !inviteCodesRequest.settled
    : false;
  const inviteCodesError = inviteCodesRequest.key === contentCode ? inviteCodesRequest.error : null;
  const drawResultsLoading = drawResultsRequestKey
    ? drawResultsRequest.key !== drawResultsRequestKey || !drawResultsRequest.settled
    : false;
  const drawResultsError = drawResultsRequest.key === drawResultsRequestKey ? drawResultsRequest.error : null;

  const makePendingCodeForm = (
    form: InvitationCodeFormState,
    offset = 0
  ): PendingInvitationCodeFormState => ({
    id: Date.now() + offset,
    form,
    saving: false,
    error: null,
  });

  const generateUniqueInviteCode = (existingCodes: Set<string>) => {
    let code = generateCode();
    let attempts = 0;

    while (existingCodes.has(code) && attempts < 100) {
      code = generateCode();
      attempts += 1;
    }

    existingCodes.add(code);
    return code;
  };

  const updateAddCodeForm = (
    formId: number,
    updater: (form: InvitationCodeFormState) => InvitationCodeFormState
  ) => {
    setAddCodeForms((prev) =>
      prev.map((item) =>
        item.id === formId ? { ...item, form: updater(item.form), error: null } : item
      )
    );
  };

  const removeAddCodeForm = (formId: number) => {
    setAddCodeForms((prev) => prev.filter((item) => item.id !== formId));
  };

  useEffect(() => {
    if (!contentCode) return;
    let ignore = false;

    getManageContentDetail(contentCode)
      .then((data) => {
        if (ignore) return;
        setContent(data);
        setEditTitle(data.title);
        setEditDescription(data.description);
        setEditStartAt(data.startAt ? data.startAt.slice(0, 16) : "");
        setEditEndAt(data.endAt ? data.endAt.slice(0, 16) : "");
        setContentRequest({ key: contentCode, settled: true, error: null });
      })
      .catch((e) => {
        if (ignore) return;
        setContentRequest({
          key: contentCode,
          settled: true,
          error: e.message ?? "콘텐츠를 불러오지 못했습니다",
        });
      });

    return () => {
      ignore = true;
    };
  }, [contentCode]);

  useEffect(() => {
    if (!contentCode) return;
    let ignore = false;

    getManageRewardsByContent(contentCode)
      .then((data) => {
        if (ignore) return;
        setRewards(data);
        const first = data[0];
        if (first) setDrawMode(first.poolCount !== null ? "DRAW" : "WEIGHTED");
        setRewardsRequest({ key: contentCode, settled: true, error: null });
      })
      .catch((e) => {
        if (ignore) return;
        setRewardsRequest({
          key: contentCode,
          settled: true,
          error: e.message ?? "보상 목록을 불러오지 못했습니다",
        });
      });

    return () => {
      ignore = true;
    };
  }, [contentCode]);

  useEffect(() => {
    if (!contentCode) return;
    let ignore = false;

    getManageInvitationCodesByContent(contentCode)
      .then((data) => {
        if (ignore) return;
        setInviteCodes(data);
        setInviteCodesRequest({ key: contentCode, settled: true, error: null });
      })
      .catch((e) => {
        if (ignore) return;
        setInviteCodesRequest({
          key: contentCode,
          settled: true,
          error: e.message ?? "추첨 코드 목록을 불러오지 못했습니다",
        });
      });

    return () => {
      ignore = true;
    };
  }, [contentCode]);

  useEffect(() => {
    if (!contentCode || !drawResultsRequestKey) return;
    const toIso = (v: string) => (v ? new Date(v).toISOString() : undefined);
    let ignore = false;

    getManageDrawResults({
      contentCode,
      drawnAtFrom: toIso(appliedFilters.drawnAtFrom),
      drawnAtTo: toIso(appliedFilters.drawnAtTo),
      delivered:
        appliedFilters.delivered === "all"
          ? undefined
          : appliedFilters.delivered === "true",
      invitationCode: appliedFilters.invitationCode || undefined,
      rewardName: appliedFilters.rewardName || undefined,
      page,
      size: PAGE_SIZE,
    })
      .then((data) => {
        if (ignore) return;
        setDrawResultsPage(data);
        setDrawResultsRequest({ key: drawResultsRequestKey, settled: true, error: null });
      })
      .catch((e) => {
        if (ignore) return;
        setDrawResultsRequest({
          key: drawResultsRequestKey,
          settled: true,
          error: e.message ?? "추첨 결과를 불러오지 못했습니다",
        });
      });

    return () => {
      ignore = true;
    };
  }, [contentCode, page, appliedFilters, drawResultsRequestKey]);

  const handleApplyFilters = () => {
    const toStartOfDay = (d: Date) => { const r = new Date(d); r.setHours(0, 0, 0, 0); return r.toISOString(); };
    const toEndOfDay = (d: Date) => { const r = new Date(d); r.setHours(23, 59, 59, 999); return r.toISOString(); };
    setAppliedFilters({
      drawnAtFrom: pendingDrawnAtFrom ? toStartOfDay(pendingDrawnAtFrom) : "",
      drawnAtTo: pendingDrawnAtTo ? toEndOfDay(pendingDrawnAtTo) : "",
      delivered: pendingDelivered,
      invitationCode: pendingInvitationCode.trim(),
      rewardName: pendingRewardName.trim(),
    });
    setPage(0);
  };

  const handleResetFilters = () => {
    setPendingDrawnAtFrom(null);
    setPendingDrawnAtTo(null);
    setPendingDelivered("all");
    setPendingInvitationCode("");
    setPendingRewardName("");
    setAppliedFilters(emptyAppliedFilters);
    setPage(0);
  };

  const shareLink = `${window.location.origin}/draw/${contentCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCopyCodeLink = (invitationCode: string, id: number) => {
    const link = `${window.location.origin}/draw/${contentCode}?code=${invitationCode}`;
    navigator.clipboard.writeText(link).catch(() => {});
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 1500);
  };

  const handleSave = async () => {
    if (!contentCode || !content) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateManageContent(contentCode, {
        type: content.type,
        title: editTitle,
        description: editDescription || undefined,
        startAt: editStartAt ? new Date(editStartAt).toISOString() : undefined,
        endAt: editEndAt ? new Date(editEndAt).toISOString() : undefined,
      });
      setContent({ ...updated, createdAt: content.createdAt });
      setIsEditingInfo(false);
    } catch (error) {
      setSaveError(getErrorMessage(error, "저장에 실패했습니다"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEditInfo = () => {
    if (content) {
      setEditTitle(content.title);
      setEditDescription(content.description);
      setEditStartAt(content.startAt ? content.startAt.slice(0, 16) : "");
      setEditEndAt(content.endAt ? content.endAt.slice(0, 16) : "");
    }
    setIsEditingInfo(false);
    setSaveError(null);
  };

  const handleDelete = async () => {
    if (!contentCode) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    setDeleting(true);
    try {
      await deleteManageContent(contentCode);
      navigate("/manage");
    } catch (error) {
      alert(getErrorMessage(error, "삭제에 실패했습니다"));
      setDeleting(false);
    }
  };

  const handleAddReward = async () => {
    if (!contentCode) return;
    const weightError = getPositiveIntegerError(addForm.weight, "가중치를 입력해주세요.", "가중치는 1 이상의 숫자여야 합니다.");
    const stockError = getNonNegativeIntegerError(addForm.stock, "수량을 입력해주세요.", "수량은 0 이상의 숫자여야 합니다.");
    const poolCountError = getNonNegativeIntegerError(addForm.poolCount, "개수를 입력해주세요.", "개수는 0 이상의 숫자여야 합니다.");

    if (drawMode === "WEIGHTED" && weightError) {
      setAddError(weightError);
      return;
    }

    if (drawMode === "WEIGHTED" && !addForm.unlimited && stockError) {
      setAddError(stockError);
      return;
    }

    if (drawMode === "DRAW" && poolCountError) {
      setAddError(poolCountError);
      return;
    }

    setAdding(true);
    setAddError(null);
    try {
      const weight = parsePositiveInteger(addForm.weight);
      const stock = parseNonNegativeInteger(addForm.stock);
      const poolCount = parseNonNegativeInteger(addForm.poolCount);

      const created = await createManageReward({
        contentCode,
        name: addForm.name,
        ...(drawMode === "WEIGHTED"
          ? {
              weight: weight.kind === "valid" ? weight.value : 1,
              stock: addForm.unlimited ? undefined : stock.kind === "valid" ? stock.value : 0,
            }
          : { poolCount: poolCount.kind === "valid" ? poolCount.value : 0 }),
        description: addForm.description || undefined,
        imageUrl: addForm.imageUrl || undefined,
        allowDuplicateReward: addForm.allowDuplicateReward,
        active: addForm.active,
      });
      setRewards((prev) => [...prev, created]);
      setShowAddForm(false);
      setAddForm(emptyForm());
    } catch (error) {
      setAddError(getErrorMessage(error, "보상 추가에 실패했습니다"));
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateReward = async () => {
    if (editingRewardId == null) return;
    const weightError = getPositiveIntegerError(editRewardForm.weight, "가중치를 입력해주세요.", "가중치는 1 이상의 숫자여야 합니다.");
    const stockError = getNonNegativeIntegerError(editRewardForm.stock, "수량을 입력해주세요.", "수량은 0 이상의 숫자여야 합니다.");
    const poolCountError = getNonNegativeIntegerError(editRewardForm.poolCount, "개수를 입력해주세요.", "개수는 0 이상의 숫자여야 합니다.");

    if (drawMode === "WEIGHTED" && weightError) {
      setEditRewardError(weightError);
      return;
    }

    if (drawMode === "WEIGHTED" && !editRewardForm.unlimited && stockError) {
      setEditRewardError(stockError);
      return;
    }

    if (drawMode === "DRAW" && poolCountError) {
      setEditRewardError(poolCountError);
      return;
    }

    setEditingReward(true);
    setEditRewardError(null);
    try {
      const weight = parsePositiveInteger(editRewardForm.weight);
      const stock = parseNonNegativeInteger(editRewardForm.stock);
      const poolCount = parseNonNegativeInteger(editRewardForm.poolCount);

      const updated = await updateManageReward(editingRewardId, {
        name: editRewardForm.name,
        ...(drawMode === "WEIGHTED"
          ? {
              weight: weight.kind === "valid" ? weight.value : 1,
              stock: editRewardForm.unlimited ? undefined : stock.kind === "valid" ? stock.value : 0,
            }
          : { poolCount: poolCount.kind === "valid" ? poolCount.value : 0 }),
        description: editRewardForm.description || undefined,
        imageUrl: editRewardForm.imageUrl || undefined,
        allowDuplicateReward: editRewardForm.allowDuplicateReward,
        active: editRewardForm.active,
      });
      setRewards((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setEditingRewardId(null);
    } catch (error) {
      setEditRewardError(getErrorMessage(error, "수정에 실패했습니다"));
    } finally {
      setEditingReward(false);
    }
  };

  const handleDeleteReward = async (rewardId: number) => {
    if (!window.confirm("보상을 삭제하시겠습니까?")) return;
    try {
      await deleteManageReward(rewardId);
      setRewards((prev) => prev.filter((r) => r.id !== rewardId));
    } catch (error) {
      alert(getErrorMessage(error, "삭제에 실패했습니다"));
    }
  };

  const handleDrawModeChange = (next: DrawMode) => {
    if (next === drawMode) return;
    if (rewards.length === 0) {
      setDrawMode(next);
      return;
    }
    setModeChangeNextMode(next);
  };

  const handleModeChangeConvert = async () => {
    if (!modeChangeNextMode) return;
    setModeChanging(true);
    try {
      const updated = await updateManageRewards({
        rewards: rewards.map((r) => ({
          rewardId: r.id,
          name: r.name,
          description: r.description,
          imageUrl: r.imageUrl,
          allowDuplicateReward: r.allowDuplicateReward,
          active: r.active,
          ...(modeChangeNextMode === "WEIGHTED" ? { weight: 1 } : { poolCount: 1 }),
        })),
      });
      setRewards(updated);
      setDrawMode(modeChangeNextMode);
      setModeChangeNextMode(null);
    } catch (error) {
      alert(getErrorMessage(error, "변환에 실패했습니다"));
    } finally {
      setModeChanging(false);
    }
  };

  const handleModeChangeReset = async () => {
    if (!contentCode || !modeChangeNextMode) return;
    setModeChanging(true);
    try {
      await deleteAllManageRewardsByContent(contentCode);
      setRewards([]);
      setDrawMode(modeChangeNextMode);
      setModeChangeNextMode(null);
    } catch (error) {
      alert(getErrorMessage(error, "초기화에 실패했습니다"));
    } finally {
      setModeChanging(false);
    }
  };

  const handleAddCode = async (formId: number) => {
    if (!contentCode) return;
    const target = addCodeForms.find((item) => item.id === formId);
    if (!target) return;

    const allowedDrawCountError = getPositiveIntegerError(
      target.form.allowedDrawCount,
      "허용 횟수를 입력해주세요.",
      "허용 횟수는 1 이상의 숫자여야 합니다."
    );
    if (allowedDrawCountError) {
      setAddCodeForms((prev) =>
        prev.map((item) => item.id === formId ? { ...item, error: allowedDrawCountError } : item)
      );
      return;
    }

    setAddCodeForms((prev) =>
      prev.map((item) => item.id === formId ? { ...item, saving: true, error: null } : item)
    );
    try {
      const allowedDrawCount = parsePositiveInteger(target.form.allowedDrawCount);

      const created = await createManageInvitationCode({
        contentCode,
        code: target.form.code,
        name: target.form.name || undefined,
        allowedDrawCount: allowedDrawCount.kind === "valid" ? allowedDrawCount.value : 1,
        active: true,
      });
      setInviteCodes((prev) => [...prev, created]);
      removeAddCodeForm(formId);
    } catch (error) {
      setAddCodeForms((prev) =>
        prev.map((item) =>
          item.id === formId
            ? { ...item, saving: false, error: getErrorMessage(error, "추첨 코드 추가에 실패했습니다") }
            : item
        )
      );
    }
  };

  const handleUpdateCode = async () => {
    if (editingCodeId == null) return;
    const allowedDrawCountError = getPositiveIntegerError(
      editCodeForm.allowedDrawCount,
      "허용 횟수를 입력해주세요.",
      "허용 횟수는 1 이상의 숫자여야 합니다."
    );
    if (allowedDrawCountError) {
      setEditCodeError(allowedDrawCountError);
      return;
    }

    setEditingCode(true);
    setEditCodeError(null);
    try {
      const allowedDrawCount = parsePositiveInteger(editCodeForm.allowedDrawCount);

      const updated = await updateManageInvitationCode(editingCodeId, {
        name: editCodeForm.name || undefined,
        allowedDrawCount: allowedDrawCount.kind === "valid" ? allowedDrawCount.value : 1,
        active: editCodeForm.active,
      });
      setInviteCodes((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setEditingCodeId(null);
    } catch (error) {
      setEditCodeError(getErrorMessage(error, "수정에 실패했습니다"));
    } finally {
      setEditingCode(false);
    }
  };

  const handleDeleteCode = async (invitationCodeId: number) => {
    if (!window.confirm("추첨 코드를 삭제하시겠습니까?")) return;
    try {
      await deleteManageInvitationCode(invitationCodeId);
      setInviteCodes((prev) => prev.filter((c) => c.id !== invitationCodeId));
    } catch (error) {
      alert(getErrorMessage(error, "삭제에 실패했습니다"));
    }
  };

  const handleImportParticipantCodes = async () => {
    if (!contentCode) return;
    setImportingParticipantCodes(true);
    setParticipantCodeImportMessage(null);
    try {
      const result = await importParticipantCodesToInvitationCodes({ contentCode });
      const latest = await getManageInvitationCodesByContent(contentCode);
      setInviteCodes(latest);
      setParticipantCodeImportMessage(
        `참여자 리스트 ${result.createdCount}개를 추가했고, 기존 코드 ${result.skippedCount}개는 건너뛰었습니다.`
      );
    } catch (error) {
      setParticipantCodeImportMessage(getErrorMessage(error, "참여자 리스트를 불러오지 못했습니다"));
    } finally {
      setImportingParticipantCodes(false);
    }
  };

  const handleLoadParticipantCodesToForms = async () => {
    setImportingParticipantCodes(true);
    setParticipantCodeImportMessage(null);
    try {
      const participantCodes = await getManageParticipantCodes();

      if (participantCodes.length === 0) {
        setParticipantCodeImportMessage("불러올 참여자 리스트가 없습니다.");
        return;
      }

      const existingCodes = new Set([
        ...inviteCodes.map((code) => code.code.trim()).filter(Boolean),
        ...addCodeForms.map((item) => item.form.code.trim()).filter(Boolean),
      ]);

      const importedForms = participantCodes.map((participantCode, index) =>
        makePendingCodeForm(
          {
            ...emptyCodeForm(),
            code: generateUniqueInviteCode(existingCodes),
            name: participantCode.participantName,
            allowedDrawCount: "1",
          },
          index
        )
      );

      setAddCodeForms((prev) => [...prev, ...importedForms]);
      setParticipantCodeImportMessage(`참여자 ${participantCodes.length}명의 코드 입력 폼을 불러왔습니다.`);
    } catch (error) {
      setParticipantCodeImportMessage(getErrorMessage(error, "참여자 리스트를 불러오지 못했습니다"));
    } finally {
      setImportingParticipantCodes(false);
    }
  };

  const handleToggleDelivery = async (drawResultId: number, currentDelivered: boolean) => {
    setUpdatingDeliveryId(drawResultId);
    try {
      const updated = await updateDeliveryStatus(drawResultId, { delivered: !currentDelivered });
      setDrawResultsPage((prev) =>
        prev
          ? { ...prev, content: prev.content.map((r) => (r.drawResultId === drawResultId ? updated : r)) }
          : prev
      );
    } catch {
      // 실패 시 상태 변경 없음
    } finally {
      setUpdatingDeliveryId(null);
    }
  };

  if (loading) {
    return <ManageLayout><p className="text-center text-muted-foreground py-20">불러오는 중...</p></ManageLayout>;
  }

  if (error || !content) {
    return <ManageLayout><p className="text-center text-destructive py-20">{error ?? "콘텐츠를 찾을 수 없습니다"}</p></ManageLayout>;
  }

  return (
    <>
    <ManageLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link to="/manage">
            <Button size="icon" variant="ghost"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">{content.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline">{getContentTypeLabel(content.type)}</Badge>
              <span className="text-xs text-muted-foreground font-mono">{content.code}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-1.5 text-xs max-w-full overflow-hidden">
          <span className="truncate text-muted-foreground">{shareLink}</span>
          <Button size="sm" variant="ghost" className="shrink-0 h-7 px-2" onClick={handleCopy}>
            <Copy className="h-3.5 w-3.5 mr-1" />
            {copied ? "복사됨" : "복사"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="info">기본정보</TabsTrigger>
          <TabsTrigger value="rewards">보상</TabsTrigger>
          <TabsTrigger value="codes">코드</TabsTrigger>
          <TabsTrigger value="results">결과</TabsTrigger>
          <TabsTrigger value="share">공유</TabsTrigger>
        </TabsList>

        {/* ── Info ── */}
        <TabsContent value="info">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">기본정보</CardTitle>
              {!isEditingInfo && (
                <Button size="sm" variant="outline" className="gap-1" onClick={() => setIsEditingInfo(true)}>
                  <Pencil className="h-3.5 w-3.5" /> 수정
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm pl-1">콘텐츠 이름</Label>
                {isEditingInfo ? (
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="콘텐츠 이름" />
                ) : (
                  <p className="text-sm text-foreground bg-muted/30 rounded-md px-3 py-2">{content.title}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm pl-1">설명</Label>
                {isEditingInfo ? (
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="콘텐츠 설명"
                    className="min-h-[80px]"
                  />
                ) : (
                  <p className="text-sm text-foreground bg-muted/30 rounded-md px-3 py-2">{content.description}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm pl-1">시작일 <span className="text-muted-foreground text-xs">(선택)</span></Label>
                  {isEditingInfo ? (
                    <Input
                      type="datetime-local"
                      value={editStartAt}
                      onChange={(e) => setEditStartAt(e.target.value)}
                    />
                  ) : (
                    <p className="text-sm text-foreground bg-muted/30 rounded-md px-3 py-2">
                      {content.startAt ? new Date(content.startAt).toLocaleString("ko-KR") : "—"}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm pl-1">종료일 <span className="text-muted-foreground text-xs">(선택)</span></Label>
                  {isEditingInfo ? (
                    <Input
                      type="datetime-local"
                      value={editEndAt}
                      onChange={(e) => setEditEndAt(e.target.value)}
                    />
                  ) : (
                    <p className="text-sm text-foreground bg-muted/30 rounded-md px-3 py-2">
                      {content.endAt ? new Date(content.endAt).toLocaleString("ko-KR") : "—"}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm pl-1">생성일</Label>
                <p className="text-sm text-muted-foreground bg-muted/30 rounded-md px-3 py-2">
                  {new Date(content.createdAt).toLocaleString("ko-KR")}
                </p>
              </div>
              {saveError && <p className="text-sm text-destructive">{saveError}</p>}
              {isEditingInfo ? (
                <div className="flex gap-2 pt-2 justify-end">
                  <Button size="sm" className="gap-1" onClick={handleSave} disabled={saving}>
                    <Save className="h-3.5 w-3.5" /> {saving ? "저장 중..." : "저장"}
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1" onClick={handleCancelEditInfo} disabled={saving}>
                    <X className="h-3.5 w-3.5" /> 취소
                  </Button>
                </div>
              ) : (
                <div className="pt-2 border-t border-border flex justify-end">
                  <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting}>
                    {deleting ? "삭제 중..." : "콘텐츠 삭제"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Rewards ── */}
        <TabsContent value="rewards">
          <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">보상 목록</CardTitle>
              {!showAddForm && (
                <Button size="sm" variant="outline" className="gap-1" onClick={() => { setShowAddForm(true); setAddForm(emptyForm()); setAddError(null); }}>
                  <Plus className="h-3.5 w-3.5" /> 추가
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">현재 추첨 모드</p>
                    <p className="text-base font-semibold text-foreground">{drawModeMeta[drawMode].label}</p>
                    <p className="text-xs text-muted-foreground">
                      {drawMode === "WEIGHTED"
                        ? "보상별 당첨 확률을 직접 설정하는 방식입니다."
                        : "미리 준비된 결과를 랜덤으로 뽑는 방식입니다."}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleDrawModeChange(drawMode === "WEIGHTED" ? "DRAW" : "WEIGHTED")}>
                    모드 변경
                  </Button>
                </div>
              </div>
              {showAddForm && (
                <RewardFormCard
                  formId="new"
                  title="새 보상 추가"
                  form={addForm}
                  onChange={setAddForm}
                  onSave={handleAddReward}
                  onCancel={() => { setShowAddForm(false); setAddError(null); }}
                  saving={adding}
                  error={addError}
                  mode={drawMode}
                />
              )}
              {rewardsLoading && (
                <p className="text-center text-muted-foreground py-6 text-sm">불러오는 중...</p>
              )}
              {!rewardsLoading && rewardsError && (
                <p className="text-center text-destructive py-6 text-sm">{rewardsError}</p>
              )}
              {!rewardsLoading && !rewardsError && rewards.length === 0 && (
                <p className="text-center text-muted-foreground py-6 text-sm">등록된 보상이 없습니다</p>
              )}
              {!rewardsLoading && rewards.map((r) =>
                editingRewardId === r.id ? (
                  <RewardFormCard
                    key={r.id}
                    formId={String(r.id)}
                    title="보상 수정"
                    form={editRewardForm}
                    onChange={setEditRewardForm}
                    onSave={handleUpdateReward}
                    onCancel={() => { setEditingRewardId(null); setEditRewardError(null); }}
                    saving={editingReward}
                    error={editRewardError}
                    mode={drawMode}
                  />
                ) : (
                  <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                    <div className="shrink-0 w-12 h-12 rounded-md border border-dashed border-border bg-muted flex items-center justify-center overflow-hidden">
                      {r.imageUrl ? (
                        <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImagePlus className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                        {!r.active && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">비활성</Badge>}
                      </div>
                      <div className="flex gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                        {r.weight !== null && (
                          <span>가중치 <span className="font-medium text-foreground">{r.weight}</span></span>
                        )}
                        {r.poolCount !== null && (
                          <span>개수 <span className="font-medium text-foreground">{r.poolCount}</span></span>
                        )}
                        {r.poolCount === null && (
                          <span>재고 <span className="font-medium text-foreground">{r.stock == null ? "무제한" : `${r.stock}개`}</span></span>
                        )}
                        {r.allowDuplicateReward && <Badge variant="outline" className="text-[10px] px-1.5 py-0">중복허용</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingRewardId(r.id); setEditRewardForm(fromApiReward(r)); setEditRewardError(null); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDeleteReward(r.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )
              )}
            </CardContent>
          </Card>
          </div>
        </TabsContent>

        {/* ── Codes ── */}
        <TabsContent value="codes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">추첨 코드 목록</CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={handleLoadParticipantCodesToForms}
                  disabled={importingParticipantCodes}
                >
                  <ListPlus className="h-3.5 w-3.5" />
                  {importingParticipantCodes ? "불러오는 중..." : "리스트 불러오기"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={handleImportParticipantCodes}
                  disabled={importingParticipantCodes}
                >
                  <ListPlus className="h-3.5 w-3.5" />
                  {importingParticipantCodes ? "불러오는 중..." : "리스트 추가"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => {
                    const existingCodes = new Set([
                      ...inviteCodes.map((code) => code.code.trim()).filter(Boolean),
                      ...addCodeForms.map((item) => item.form.code.trim()).filter(Boolean),
                    ]);
                    setAddCodeForms((prev) => [
                      ...prev,
                      makePendingCodeForm({
                        ...emptyCodeForm(),
                        code: generateUniqueInviteCode(existingCodes),
                      }),
                    ]);
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> 추가
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {participantCodeImportMessage && (
                <p className="text-sm text-muted-foreground">{participantCodeImportMessage}</p>
              )}
              {addCodeForms.map((item, index) => (
                <InvitationCodeFormCard
                  key={item.id}
                  title={addCodeForms.length > 1 ? `새 추첨 코드 추가 #${index + 1}` : "새 추첨 코드 추가"}
                  form={item.form}
                  onChange={(form) => updateAddCodeForm(item.id, () => form)}
                  onSave={() => handleAddCode(item.id)}
                  onCancel={() => removeAddCodeForm(item.id)}
                  saving={item.saving}
                  error={item.error}
                />
              ))}
              {inviteCodesLoading && (
                <p className="text-center text-muted-foreground py-6 text-sm">불러오는 중...</p>
              )}
              {!inviteCodesLoading && inviteCodesError && (
                <p className="text-center text-destructive py-6 text-sm">{inviteCodesError}</p>
              )}
              {!inviteCodesLoading && !inviteCodesError && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="px-5 py-2">코드</th>
                        <th className="px-5 py-2">이름</th>
                        <th className="px-5 py-2 text-center">허용/사용</th>
                        <th className="px-5 py-2 text-center">남은 횟수</th>
                        <th className="px-5 py-2 text-center">활성</th>
                        <th className="px-5 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {inviteCodes.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-5 py-6 text-center text-muted-foreground">등록된 추첨 코드가 없습니다</td>
                        </tr>
                      )}
                      {inviteCodes.map((c) =>
                        editingCodeId === c.id ? (
                          <tr key={c.id}>
                            <td colSpan={6} className="px-3 py-2">
                              <InvitationCodeFormCard
                                title="추첨 코드 수정"
                                form={editCodeForm}
                                onChange={setEditCodeForm}
                                onSave={handleUpdateCode}
                                onCancel={() => { setEditingCodeId(null); setEditCodeError(null); }}
                                saving={editingCode}
                                error={editCodeError}
                                isEdit
                              />
                            </td>
                          </tr>
                        ) : (
                          <tr key={c.id} className="border-b last:border-0">
                            <td className="px-5 py-2.5 font-mono text-xs text-foreground">{c.code}</td>
                            <td className="px-5 py-2.5 text-foreground">{c.name || "—"}</td>
                            <td className="px-5 py-2.5 text-center text-muted-foreground">
                              {c.allowedDrawCount} / {c.usedDrawCount}
                            </td>
                            <td className="px-5 py-2.5 text-center">
                              <Badge variant={c.remainingCount > 0 ? "default" : "secondary"}>{c.remainingCount}</Badge>
                            </td>
                            <td className="px-5 py-2.5 text-center">
                              <Badge variant={c.active ? "default" : "secondary"}>{c.active ? "활성" : "비활성"}</Badge>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex gap-1 justify-end">
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleCopyCodeLink(c.code, c.id)}>
                                  {copiedCodeId === c.id ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingCodeId(c.id); setEditCodeForm(fromApiCode(c)); setEditCodeError(null); }}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDeleteCode(c.id)}>
                                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Results ── */}
        <TabsContent value="results">
          {(() => {
            const hasActiveFilter =
              appliedFilters.drawnAtFrom !== "" || appliedFilters.drawnAtTo !== "" ||
              appliedFilters.delivered !== "all" || appliedFilters.invitationCode !== "" ||
              appliedFilters.rewardName !== "";
            const totalPages = drawResultsPage?.totalPages ?? 0;
            const currentPage = (drawResultsPage?.number ?? 0) + 1;
            const pageNumbers = (() => {
              const max = 5;
              let start = Math.max(1, currentPage - 2);
              const end = Math.min(totalPages, start + max - 1);
              start = Math.max(1, end - max + 1);
              return Array.from({ length: end - start + 1 }, (_, i) => start + i);
            })();
            return (
              <div className="space-y-6">
                {/* Filter Card */}
                <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="pb-3 cursor-pointer select-none hover:bg-muted/40 transition-colors rounded-t-lg">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          상세 검색
                          {hasActiveFilter && (
                            <Badge variant="secondary" className="text-xs">필터 적용 중</Badge>
                          )}
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform duration-200",
                            isFilterOpen && "rotate-180"
                          )}
                        />
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Start date */}
                      <div className="space-y-1.5">
                        <Label className="text-sm">시작일</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !pendingDrawnAtFrom && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {pendingDrawnAtFrom ? format(pendingDrawnAtFrom, "yyyy.MM.dd") : "날짜 선택"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={pendingDrawnAtFrom ?? undefined}
                              onSelect={(d) => setPendingDrawnAtFrom(d ?? null)}
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* End date */}
                      <div className="space-y-1.5">
                        <Label className="text-sm">종료일</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !pendingDrawnAtTo && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {pendingDrawnAtTo ? format(pendingDrawnAtTo, "yyyy.MM.dd") : "날짜 선택"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={pendingDrawnAtTo ?? undefined}
                              onSelect={(d) => setPendingDrawnAtTo(d ?? null)}
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Delivered status */}
                      <div className="space-y-1.5">
                        <Label className="text-sm">지급 상태</Label>
                        <Select
                          value={pendingDelivered}
                          onValueChange={(v) => setPendingDelivered(v as DeliveredFilter)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">전체</SelectItem>
                            <SelectItem value="true">지급완료</SelectItem>
                            <SelectItem value="false">미지급</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Invitation code */}
                      <div className="space-y-1.5">
                        <Label className="text-sm">추첨 코드</Label>
                        <Input
                          placeholder="정확히 일치"
                          value={pendingInvitationCode}
                          onChange={(e) => setPendingInvitationCode(e.target.value)}
                        />
                      </div>

                      {/* Reward name */}
                      <div className="space-y-1.5">
                        <Label className="text-sm">보상명</Label>
                        <Input
                          placeholder="부분 일치"
                          value={pendingRewardName}
                          onChange={(e) => setPendingRewardName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                      <Button variant="outline" onClick={handleResetFilters} className="gap-1.5">
                        <RotateCcw className="h-4 w-4" />
                        초기화
                      </Button>
                      <Button onClick={handleApplyFilters} className="gap-1.5">
                        <Search className="h-4 w-4" />
                        검색
                      </Button>
                    </div>
                  </CardContent>
                  </CollapsibleContent>
                </Card>
                </Collapsible>

                {/* Results Card */}
                <Card>
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-base">조회 결과</CardTitle>
                    <span className="text-sm text-muted-foreground">
                      총 {drawResultsPage?.totalElements ?? 0}건
                    </span>
                  </CardHeader>
                  <CardContent>
                    {drawResultsLoading && (
                      <p className="text-center text-muted-foreground py-6 text-sm">불러오는 중...</p>
                    )}
                    {!drawResultsLoading && drawResultsError && (
                      <p className="text-center text-destructive py-6 text-sm">{drawResultsError}</p>
                    )}
                    {!drawResultsLoading && !drawResultsError && (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="whitespace-nowrap">코드</TableHead>
                              <TableHead className="whitespace-nowrap">이름</TableHead>
                              <TableHead className="whitespace-nowrap">보상</TableHead>
                              <TableHead className="whitespace-nowrap">지급</TableHead>
                              <TableHead className="whitespace-nowrap">시간</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(drawResultsPage?.content.length ?? 0) === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                                  추첨 결과가 없습니다
                                </TableCell>
                              </TableRow>
                            ) : (
                              (drawResultsPage?.content ?? []).map((r) => (
                                <TableRow key={r.drawResultId} className="hover:bg-muted/50">
                                  <TableCell className="whitespace-nowrap font-mono text-xs">
                                    {r.invitationCode}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    {r.invitationCodeName || "—"}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">{r.rewardName}</TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    <StateToggleButton
                                      checked={r.delivered}
                                      onCheckedChange={() => handleToggleDelivery(r.drawResultId, r.delivered)}
                                      checkedLabel="지급완료"
                                      uncheckedLabel="미지급"
                                      className={`h-7 ${updatingDeliveryId === r.drawResultId ? "opacity-50 pointer-events-none" : ""}`}
                                    />
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap text-muted-foreground">
                                    {new Date(r.drawnAt).toLocaleString("ko-KR")}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-1 mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={drawResultsPage?.first ?? true}
                          onClick={() => setPage((p) => Math.max(0, p - 1))}
                        >
                          이전
                        </Button>
                        {pageNumbers.map((n) => (
                          <Button
                            key={n}
                            variant={n === currentPage ? "default" : "outline"}
                            size="sm"
                            className="w-9"
                            onClick={() => setPage(n - 1)}
                          >
                            {n}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={drawResultsPage?.last ?? true}
                          onClick={() => setPage((p) => p + 1)}
                        >
                          다음
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })()}
        </TabsContent>

        {/* ── Share ── */}
        <TabsContent value="share">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground">참여 링크</Label>
                <div className="flex items-center gap-2">
                  <Input readOnly value={shareLink} className="text-xs" />
                  <Button size="sm" variant="outline" onClick={handleCopy}>
                    {copied ? "복사됨" : "복사"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ManageLayout>

    <ModeChangeWarningModal
      open={modeChangeNextMode !== null}
      currentMode={drawMode}
      nextMode={modeChangeNextMode}
      onClose={() => setModeChangeNextMode(null)}
      onConvertClick={handleModeChangeConvert}
      onResetClick={handleModeChangeReset}
      loading={modeChanging}
    />
    </>
  );
};

export default ManageContent;
