import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ManageLayout from "@/components/manage/ManageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, ArrowLeft, Pencil, Plus, Trash2, X, Check, ImagePlus } from "lucide-react";
import {
  getManageContentDetail,
  updateManageContent,
  deleteManageContent,
  getManageRewardsByContent,
  createManageReward,
  updateManageReward,
  deleteManageReward,
  getManageInvitationCodesByContent,
  createManageInvitationCode,
  updateManageInvitationCode,
  deleteManageInvitationCode,
} from "@/api/client";
import type { ManageContentDetailResponse, ManageRewardResponse, ManageInvitationCodeResponse } from "@/api/types";
import { mockResults } from "@/data/manageMockData";

// ── Local form types ────────────────────────────────────────────────────────

interface InvitationCodeFormState {
  code: string;
  name: string;
  allowedDrawCount: number;
  active: boolean;
}

const emptyCodeForm = (): InvitationCodeFormState => ({
  code: "", name: "", allowedDrawCount: 1, active: true,
});

const fromApiCode = (c: ManageInvitationCodeResponse): InvitationCodeFormState => ({
  code: c.code,
  name: c.name ?? "",
  allowedDrawCount: c.allowedDrawCount,
  active: c.active,
});

interface RewardFormState {
  name: string;
  description: string;
  weight: number;
  stock: number;
  unlimited: boolean;
  imageUrl: string;
  allowDuplicateReward: boolean;
}

const emptyForm = (): RewardFormState => ({
  name: "", description: "", weight: 10, stock: 10,
  unlimited: false, imageUrl: "", allowDuplicateReward: false,
});

const fromApiReward = (r: ManageRewardResponse): RewardFormState => ({
  name: r.name,
  description: r.description ?? "",
  weight: r.weight,
  stock: r.stock ?? 0,
  unlimited: r.stock == null,
  imageUrl: r.imageUrl ?? "",
  allowDuplicateReward: r.allowDuplicateReward,
});

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
}> = ({ formId, title, form, onChange, onSave, onCancel, saving, error }) => (
  <Card className="border border-primary/30 bg-muted/20">
    <CardContent className="p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div className="space-y-1.5">
        <Label className="text-sm">보상 이름</Label>
        <Input placeholder="예: 스타벅스 쿠폰" value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm">설명</Label>
        <Input placeholder="보상에 대한 간단한 설명" value={form.description} onChange={(e) => onChange({ ...form, description: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm">가중치</Label>
          <Input type="number" placeholder="10" value={form.weight} onChange={(e) => onChange({ ...form, weight: Number(e.target.value) })} />
          <p className="text-[11px] text-muted-foreground">당첨 확률 비율에 사용되는 값</p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">수량</Label>
          <Input
            type="number"
            placeholder="5"
            value={form.stock}
            disabled={form.unlimited}
            className={form.unlimited ? "opacity-50" : ""}
            onChange={(e) => onChange({ ...form, stock: Number(e.target.value) })}
          />
          <p className="text-[11px] text-muted-foreground">남아 있는 보상 개수</p>
          <div className="flex items-center gap-2 pt-1">
            <Switch
              id={`unlimited-${formId}`}
              checked={form.unlimited}
              onCheckedChange={(checked) => onChange({ ...form, unlimited: !!checked })}
            />
            <Label htmlFor={`unlimited-${formId}`} className="text-xs text-muted-foreground cursor-pointer">무제한</Label>
          </div>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm">이미지 URL</Label>
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
      <div className="flex items-center gap-2">
        <Checkbox
          id={`dup-${formId}`}
          checked={form.allowDuplicateReward}
          onCheckedChange={(checked) => onChange({ ...form, allowDuplicateReward: !!checked })}
        />
        <Label htmlFor={`dup-${formId}`} className="text-sm cursor-pointer">중복 당첨 허용</Label>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2 pt-1">
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
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {!isEdit && (
        <div className="space-y-1.5">
          <Label className="text-sm">코드</Label>
          <Input className="font-mono" placeholder="예: LUCKY-001" value={form.code} onChange={(e) => onChange({ ...form, code: e.target.value })} />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm">참여자 이름</Label>
          <Input placeholder="참여자 이름 (선택)" value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">허용 횟수</Label>
          <Input type="number" placeholder="1" value={form.allowedDrawCount} onChange={(e) => onChange({ ...form, allowedDrawCount: Number(e.target.value) })} />
        </div>
      </div>
      {isEdit && (
        <div className="flex items-center gap-2">
          <Switch
            id="code-active"
            checked={form.active}
            onCheckedChange={(checked) => onChange({ ...form, active: !!checked })}
          />
          <Label htmlFor="code-active" className="text-sm cursor-pointer">활성화</Label>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2 pt-1">
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

const typeLabel: Record<string, string> = {
  draw: "뽑기",
  quiz: "퀴즈",
  messagebox: "메시지함",
};

const ManageContent: React.FC = () => {
  const { contentCode } = useParams<{ contentCode: string }>();
  const navigate = useNavigate();

  // Content state
  const [content, setContent] = useState<ManageContentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Edit content state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Rewards state
  const [rewards, setRewards] = useState<ManageRewardResponse[]>([]);
  const [rewardsLoading, setRewardsLoading] = useState(false);
  const [rewardsError, setRewardsError] = useState<string | null>(null);

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
  const [inviteCodesLoading, setInviteCodesLoading] = useState(false);
  const [inviteCodesError, setInviteCodesError] = useState<string | null>(null);

  // Add invitation code form
  const [showAddCodeForm, setShowAddCodeForm] = useState(false);
  const [addCodeForm, setAddCodeForm] = useState<InvitationCodeFormState>(emptyCodeForm());
  const [addingCode, setAddingCode] = useState(false);
  const [addCodeError, setAddCodeError] = useState<string | null>(null);

  // Edit invitation code form
  const [editingCodeId, setEditingCodeId] = useState<number | null>(null);
  const [editCodeForm, setEditCodeForm] = useState<InvitationCodeFormState>(emptyCodeForm());
  const [editingCode, setEditingCode] = useState(false);
  const [editCodeError, setEditCodeError] = useState<string | null>(null);

  useEffect(() => {
    if (!contentCode) return;
    setLoading(true);
    setError(null);
    getManageContentDetail(contentCode)
      .then((data) => {
        setContent(data);
        setEditTitle(data.title);
        setEditDescription(data.description);
        setEditType(data.type);
      })
      .catch((e) => setError(e.message ?? "콘텐츠를 불러오지 못했습니다"))
      .finally(() => setLoading(false));
  }, [contentCode]);

  useEffect(() => {
    if (!contentCode) return;
    setRewardsLoading(true);
    setRewardsError(null);
    getManageRewardsByContent(contentCode)
      .then(setRewards)
      .catch((e) => setRewardsError(e.message ?? "보상 목록을 불러오지 못했습니다"))
      .finally(() => setRewardsLoading(false));
  }, [contentCode]);

  useEffect(() => {
    if (!contentCode) return;
    setInviteCodesLoading(true);
    setInviteCodesError(null);
    getManageInvitationCodesByContent(contentCode)
      .then(setInviteCodes)
      .catch((e) => setInviteCodesError(e.message ?? "추첨 코드 목록을 불러오지 못했습니다"))
      .finally(() => setInviteCodesLoading(false));
  }, [contentCode]);

  const shareLink = `${window.location.origin}/draw?contentCode=${contentCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSave = async () => {
    if (!contentCode) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const updated = await updateManageContent(contentCode, {
        type: editType,
        title: editTitle,
        description: editDescription,
      });
      setContent({ ...updated, createdAt: content?.createdAt ?? updated.createdAt });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e: any) {
      setSaveError(e.message ?? "저장에 실패했습니다");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!contentCode) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    setDeleting(true);
    try {
      await deleteManageContent(contentCode);
      navigate("/manage");
    } catch (e: any) {
      alert(e.message ?? "삭제에 실패했습니다");
      setDeleting(false);
    }
  };

  const handleAddReward = async () => {
    if (!contentCode) return;
    setAdding(true);
    setAddError(null);
    try {
      const created = await createManageReward({
        contentCode,
        name: addForm.name,
        weight: addForm.weight,
        stock: addForm.unlimited ? undefined : addForm.stock,
        description: addForm.description || undefined,
        imageUrl: addForm.imageUrl || undefined,
        allowDuplicateReward: addForm.allowDuplicateReward,
      });
      setRewards((prev) => [...prev, created]);
      setShowAddForm(false);
      setAddForm(emptyForm());
    } catch (e: any) {
      setAddError(e.message ?? "보상 추가에 실패했습니다");
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateReward = async () => {
    if (editingRewardId == null) return;
    setEditingReward(true);
    setEditRewardError(null);
    try {
      const updated = await updateManageReward(editingRewardId, {
        name: editRewardForm.name,
        weight: editRewardForm.weight,
        stock: editRewardForm.unlimited ? undefined : editRewardForm.stock,
        description: editRewardForm.description || undefined,
        imageUrl: editRewardForm.imageUrl || undefined,
        allowDuplicateReward: editRewardForm.allowDuplicateReward,
      });
      setRewards((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setEditingRewardId(null);
    } catch (e: any) {
      setEditRewardError(e.message ?? "수정에 실패했습니다");
    } finally {
      setEditingReward(false);
    }
  };

  const handleDeleteReward = async (rewardId: number) => {
    if (!window.confirm("보상을 삭제하시겠습니까?")) return;
    try {
      await deleteManageReward(rewardId);
      setRewards((prev) => prev.filter((r) => r.id !== rewardId));
    } catch (e: any) {
      alert(e.message ?? "삭제에 실패했습니다");
    }
  };

  const handleAddCode = async () => {
    if (!contentCode) return;
    setAddingCode(true);
    setAddCodeError(null);
    try {
      const created = await createManageInvitationCode({
        contentCode,
        code: addCodeForm.code,
        name: addCodeForm.name || undefined,
        allowedDrawCount: addCodeForm.allowedDrawCount,
      });
      setInviteCodes((prev) => [...prev, created]);
      setShowAddCodeForm(false);
      setAddCodeForm(emptyCodeForm());
    } catch (e: any) {
      setAddCodeError(e.message ?? "추첨 코드 추가에 실패했습니다");
    } finally {
      setAddingCode(false);
    }
  };

  const handleUpdateCode = async () => {
    if (editingCodeId == null) return;
    setEditingCode(true);
    setEditCodeError(null);
    try {
      const updated = await updateManageInvitationCode(editingCodeId, {
        name: editCodeForm.name || undefined,
        allowedDrawCount: editCodeForm.allowedDrawCount,
        active: editCodeForm.active,
      });
      setInviteCodes((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setEditingCodeId(null);
    } catch (e: any) {
      setEditCodeError(e.message ?? "수정에 실패했습니다");
    } finally {
      setEditingCode(false);
    }
  };

  const handleDeleteCode = async (invitationCodeId: number) => {
    if (!window.confirm("추첨 코드를 삭제하시겠습니까?")) return;
    try {
      await deleteManageInvitationCode(invitationCodeId);
      setInviteCodes((prev) => prev.filter((c) => c.id !== invitationCodeId));
    } catch (e: any) {
      alert(e.message ?? "삭제에 실패했습니다");
    }
  };

  if (loading) {
    return <ManageLayout><p className="text-center text-muted-foreground py-20">불러오는 중...</p></ManageLayout>;
  }

  if (error || !content) {
    return <ManageLayout><p className="text-center text-destructive py-20">{error ?? "콘텐츠를 찾을 수 없습니다"}</p></ManageLayout>;
  }

  return (
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
              <Badge variant="outline">{typeLabel[content.type] ?? content.type}</Badge>
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
              <CardTitle className="text-base">기본 정보 수정</CardTitle>
              <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? "삭제 중..." : "삭제"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>타입</Label>
                <Input value={editType} onChange={(e) => setEditType(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>제목</Label>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>설명</Label>
                <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "저장 중..." : "저장"}
                </Button>
                {saveSuccess && <span className="text-sm text-green-600">저장되었습니다</span>}
                {saveError && <span className="text-sm text-destructive">{saveError}</span>}
              </div>
              <div className="pt-2 text-xs text-muted-foreground space-y-1">
                <p>콘텐츠 코드: <span className="font-mono">{content.code}</span></p>
                <p>생성일: {new Date(content.createdAt).toLocaleString("ko-KR")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Rewards ── */}
        <TabsContent value="rewards">
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
                        <span>가중치 <span className="font-medium text-foreground">{r.weight}</span></span>
                        <span>재고 <span className="font-medium text-foreground">{r.stock == null ? "무제한" : `${r.stock}개`}</span></span>
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
        </TabsContent>

        {/* ── Codes ── */}
        <TabsContent value="codes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">추첨 코드 목록</CardTitle>
              {!showAddCodeForm && (
                <Button size="sm" variant="outline" className="gap-1" onClick={() => { setShowAddCodeForm(true); setAddCodeForm(emptyCodeForm()); setAddCodeError(null); }}>
                  <Plus className="h-3.5 w-3.5" /> 추가
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {showAddCodeForm && (
                <InvitationCodeFormCard
                  title="새 추첨 코드 추가"
                  form={addCodeForm}
                  onChange={setAddCodeForm}
                  onSave={handleAddCode}
                  onCancel={() => { setShowAddCodeForm(false); setAddCodeError(null); }}
                  saving={addingCode}
                  error={addCodeError}
                />
              )}
              {inviteCodesLoading && (
                <p className="text-center text-muted-foreground py-6 text-sm">불러오는 중...</p>
              )}
              {!inviteCodesLoading && inviteCodesError && (
                <p className="text-center text-destructive py-6 text-sm">{inviteCodesError}</p>
              )}
              {!inviteCodesLoading && !inviteCodesError && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
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

        {/* ── Results (mock) ── */}
        <TabsContent value="results">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="px-5 py-2">코드</th>
                      <th className="px-5 py-2">보상</th>
                      <th className="px-5 py-2">시간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockResults.map((r) => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="px-5 py-2.5 font-mono text-xs text-foreground">{r.code}</td>
                        <td className="px-5 py-2.5 text-foreground">{r.reward}</td>
                        <td className="px-5 py-2.5 text-muted-foreground">{r.drawnAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
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
  );
};

export default ManageContent;
