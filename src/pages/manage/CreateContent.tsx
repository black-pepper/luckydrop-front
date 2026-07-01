import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ManageLayout from "@/components/manage/ManageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { StateToggleButton } from "@/components/ui/state-toggle-button";
import { Trash2, Plus, ArrowLeft, ArrowRight, Gift, HelpCircle, MessageSquare, ImagePlus, ListPlus } from "lucide-react";
import { createManageContent, createManageRewards, createManageInvitationCodesBatch, getManageParticipantCodes } from "@/api/client";
import { generateCode } from "@/lib/utils";
import type { ContentType } from "@/data/manageMockData";
import DrawModeTabs, { type DrawMode } from "@/components/manage/DrawModeTabs";

const typeOptions: { value: ContentType; label: string; icon: React.ReactNode; desc: string; disabled?: boolean }[] = [
  { value: "DRAW", label: "뽑기", icon: <Gift className="h-7 w-7" />, desc: "보상을 설정하고 참여자가 뽑기" },
  { value: "QUIZ", label: "퀴즈", icon: <HelpCircle className="h-7 w-7" />, desc: "준비 중인 기능입니다", disabled: true },
  { value: "MESSAGEBOX", label: "메시지함", icon: <MessageSquare className="h-7 w-7" />, desc: "준비 중인 기능입니다", disabled: true },
];

interface RewardRow {
  id: number;
  name: string;
  weight: string;
  poolCount: string;
  stock: string;
  imageUrl: string;
  unlimited: boolean;
  allowDuplicateReward: boolean;
  active: boolean;
}
interface CodeRow { id: number; code: string; name: string; allowedDrawCount: string }
type ValidationErrors = Record<string, string>;

const initialRewards: RewardRow[] = [
  { id: 1, name: "교환권", weight: "10", poolCount: "5", stock: "12", imageUrl: "https://placehold.co/120x120/e2e8f0/64748b?text=☕", unlimited: false, allowDuplicateReward: true, active: true },
  { id: 2, name: "꽝", weight: "60", poolCount: "5", stock: "", imageUrl: "", unlimited: true, allowDuplicateReward: true, active: true },
];

const initialCodes: CodeRow[] = [];

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

const findDuplicateCodeIds = (codes: CodeRow[]) => {
  const groupedIds = new Map<string, number[]>();

  codes.forEach((code) => {
    const trimmedCode = code.code.trim();
    if (trimmedCode.length === 0) return;

    const ids = groupedIds.get(trimmedCode) ?? [];
    ids.push(code.id);
    groupedIds.set(trimmedCode, ids);
  });

  return Array.from(groupedIds.values())
    .filter((ids) => ids.length > 1)
    .flat();
};

const CreateContent: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [contentType, setContentType] = useState<ContentType | null>("DRAW");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [rewards, setRewards] = useState<RewardRow[]>(initialRewards);
  const [drawMode, setDrawMode] = useState<DrawMode>("WEIGHTED");
  const [codes, setCodes] = useState<CodeRow[]>(initialCodes);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [importingParticipantCodes, setImportingParticipantCodes] = useState(false);

  const clearFieldError = (field: string) => {
    setValidationErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const addReward = () =>
    setRewards((r) => [...r, { id: Date.now(), name: "", weight: "", poolCount: "", stock: "", imageUrl: "", unlimited: true, allowDuplicateReward: true, active: true }]);
  const removeReward = (id: number) => setRewards((r) => r.filter((x) => x.id !== id));
  const updateReward = (id: number, field: keyof RewardRow, value: string | boolean) => {
    clearFieldError(`rewards.${id}.${field}`);
    setRewards((r) => r.map((x) => (x.id === id ? { ...x, [field]: value } : x)));
  };

  const addCode = () => setCodes((c) => [...c, { id: Date.now(), code: generateCode(), name: "", allowedDrawCount: "" }]);
  const removeCode = (id: number) => setCodes((c) => c.filter((x) => x.id !== id));
  const updateCode = (id: number, field: keyof CodeRow, value: string) => {
    clearFieldError(`codes.${id}.${field}`);
    setCodes((c) => c.map((x) => (x.id === id ? { ...x, [field]: value } : x)));
  };

  const importParticipantCodes = async () => {
    setImportingParticipantCodes(true);
    setSubmitError(null);
    try {
      const participantCodes = await getManageParticipantCodes();
      let skippedCount = 0;
      setCodes((prev) => {
        const existingCodes = new Set(prev.map((code) => code.code.trim()).filter(Boolean));
        const imported = participantCodes
          .filter((participantCode) => {
            if (existingCodes.has(participantCode.code)) {
              skippedCount += 1;
              return false;
            }
            existingCodes.add(participantCode.code);
            return true;
          })
          .map((participantCode, index) => ({
            id: Date.now() + index,
            code: participantCode.code,
            name: participantCode.participantName,
            allowedDrawCount: "1",
          }));

        return [...prev, ...imported];
      });

      if (participantCodes.length === 0) {
        setSubmitError("불러올 참여자 리스트가 없습니다.");
      } else if (skippedCount > 0) {
        setSubmitError(`이미 추가된 코드 ${skippedCount}개를 제외하고 불러왔습니다.`);
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "참여자 리스트를 불러오지 못했습니다");
    } finally {
      setImportingParticipantCodes(false);
    }
  };

  const validateStep = (targetStep: number) => {
    const errors: ValidationErrors = {};

    if (targetStep === 1 && !contentType) {
      errors.contentType = "콘텐츠 유형을 선택해주세요.";
    }

    if (targetStep === 2 && title.trim().length === 0) {
      errors.title = "제목을 입력해주세요.";
    }

    if (targetStep === 3) {
      rewards.forEach((reward) => {
        if (reward.name.trim().length === 0) {
          errors[`rewards.${reward.id}.name`] = "보상 이름을 입력해주세요.";
        }

        if (drawMode === "WEIGHTED") {
          const weight = parsePositiveInteger(reward.weight);
          if (weight.kind === "empty") {
            errors[`rewards.${reward.id}.weight`] = "가중치를 입력해주세요.";
          } else if (weight.kind !== "valid") {
            errors[`rewards.${reward.id}.weight`] = "가중치는 1 이상의 숫자여야 합니다.";
          }

          if (!reward.unlimited) {
            const stock = parseNonNegativeInteger(reward.stock);
            if (stock.kind === "empty") {
              errors[`rewards.${reward.id}.stock`] = "수량을 입력해주세요.";
            } else if (stock.kind !== "valid") {
              errors[`rewards.${reward.id}.stock`] = "수량은 0 이상의 숫자여야 합니다.";
            }
          }
        } else {
          const poolCount = parseNonNegativeInteger(reward.poolCount);
          if (poolCount.kind === "empty") {
            errors[`rewards.${reward.id}.poolCount`] = "개수를 입력해주세요.";
          } else if (poolCount.kind !== "valid") {
            errors[`rewards.${reward.id}.poolCount`] = "개수는 0 이상의 숫자여야 합니다.";
          }
        }
      });
    }

    if (targetStep === 4) {
      codes.forEach((code) => {
        if (code.code.trim().length === 0) {
          errors[`codes.${code.id}.code`] = "코드를 입력해주세요.";
        }

        if (code.name.trim().length === 0) {
          errors[`codes.${code.id}.name`] = "참여자 이름을 입력해주세요.";
        }

        const allowedDrawCount = parsePositiveInteger(code.allowedDrawCount);
        if (allowedDrawCount.kind === "empty") {
          errors[`codes.${code.id}.allowedDrawCount`] = "허용 횟수를 입력해주세요.";
        } else if (allowedDrawCount.kind !== "valid") {
          errors[`codes.${code.id}.allowedDrawCount`] = "허용 횟수는 1 이상의 숫자여야 합니다.";
        }
      });

      findDuplicateCodeIds(codes).forEach((id) => {
        errors[`codes.${id}.code`] = "중복된 코드는 사용할 수 없습니다.";
      });
    }

    return errors;
  };

  const handleNext = () => {
    const errors = validateStep(step);
    setValidationErrors(errors);
    if (Object.keys(errors).length === 0) {
      setStep((s) => s + 1);
    }
  };

  const handleSubmit = async () => {
    const step2Errors = validateStep(2);
    const step3Errors = validateStep(3);
    const step4Errors = validateStep(4);
    const mergedErrors = { ...step2Errors, ...step3Errors, ...step4Errors };

    setValidationErrors(mergedErrors);

    if (Object.keys(mergedErrors).length > 0) {
      if (Object.keys(step2Errors).length > 0) setStep(2);
      else if (Object.keys(step3Errors).length > 0) setStep(3);
      else if (Object.keys(step4Errors).length > 0) setStep(4);
      return;
    }

    if (!contentType) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createManageContent({
        type: contentType,
        title: title.trim(),
        description: description.trim(),
        startAt: startAt ? new Date(startAt).toISOString() : undefined,
        endAt: endAt ? new Date(endAt).toISOString() : undefined,
      });
      if (rewards.length > 0) {
        await createManageRewards({
          contentCode: created.code,
          rewards: rewards.map((r) => {
            const weight = parsePositiveInteger(r.weight);
            const stock = parseNonNegativeInteger(r.stock);
            const poolCount = parseNonNegativeInteger(r.poolCount);

            return {
              name: r.name,
              ...(drawMode === "WEIGHTED"
                ? {
                    weight: weight.kind === "valid" ? weight.value : 1,
                    stock: r.unlimited ? undefined : stock.kind === "valid" ? stock.value : 0,
                  }
                : { poolCount: poolCount.kind === "valid" ? poolCount.value : 0 }),
              imageUrl: r.imageUrl || undefined,
              allowDuplicateReward: r.allowDuplicateReward,
              active: r.active,
            };
          }),
        });
      }
      const invitationCodes = codes
        .filter(
          (c) =>
            c.code.trim().length > 0 &&
            c.name.trim().length > 0 &&
            parsePositiveInteger(c.allowedDrawCount).kind === "valid"
        )
        .map((c) => {
          const allowedDrawCount = parsePositiveInteger(c.allowedDrawCount);

          return {
            code: c.code.trim(),
            name: c.name.trim(),
            allowedDrawCount: allowedDrawCount.kind === "valid" ? allowedDrawCount.value : 1,
          };
        });

      if (invitationCodes.length > 0) {
        await createManageInvitationCodesBatch({
          contentCode: created.code,
          invitationCodes,
        });
      }

      navigate("/manage");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "콘텐츠 생성에 실패했습니다");
      setSubmitting(false);
    }
  };

  return (
    <ManageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">콘텐츠 만들기</h1>
        <div className="flex items-center gap-2 mt-3">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">단계 {step} / 4</p>
        {step === 1 && validationErrors.contentType && (
          <p className="text-sm text-destructive mt-2">{validationErrors.contentType}</p>
        )}
      </div>

      {/* Step 1: Type */}
      {step === 1 && (
        <div className="flex flex-wrap gap-3 justify-center">
          {typeOptions.filter((opt) => !opt.disabled).map((opt) => (
            <Card
              key={opt.value}
              className={`w-64 transition-shadow cursor-pointer hover:shadow-md ${contentType === opt.value ? "ring-2 ring-primary" : ""}`}
              onClick={() => {
                setContentType(opt.value);
                clearFieldError("contentType");
              }}
            >
              <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
                <div className="text-primary">{opt.icon}</div>
                <h3 className="font-semibold text-foreground">{opt.label}</h3>
                <p className="text-xs text-muted-foreground">{opt.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Step 2: Basic info */}
      {step === 2 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">기본 정보</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>제목 <span className="text-destructive">*</span></Label>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  clearFieldError("title");
                }}
                placeholder="이벤트 제목을 입력하세요"
                className={validationErrors.title ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {validationErrors.title && <p className="text-sm text-destructive">{validationErrors.title}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>설명 <span className="text-muted-foreground text-xs">(선택)</span></Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="간단한 설명을 입력하세요" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>시작일 <span className="text-muted-foreground text-xs">(선택)</span></Label>
                <Input
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>종료일 <span className="text-muted-foreground text-xs">(선택)</span></Label>
                <Input
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between hidden">
              <Label>공개 여부</Label>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Rewards */}
      {step === 3 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">보상 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DrawModeTabs value={drawMode} onChange={setDrawMode} />
              {rewards.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">보상 없이 생성할 수 있습니다</p>
                  <p className="text-xs mt-1">필요하면 아래 버튼으로 추가하고, 나중에 다시 등록해도 됩니다.</p>
                </div>
              )}
              {rewards.map((r, idx) => (
                <Card key={r.id} className="border border-border bg-muted/30">
                  <CardContent className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">보상 #{idx + 1}</span>
                      <StateToggleButton
                        checked={r.active}
                        onCheckedChange={(v) => updateReward(r.id, "active", v)}
                        checkedLabel="추첨 포함"
                        uncheckedLabel="추첨 제외"
                        className="h-7"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm pl-1">보상 이름 <span className="text-destructive">*</span></Label>
                      <Input
                        placeholder="예: 000 교환권"
                        value={r.name}
                        onChange={(e) => updateReward(r.id, "name", e.target.value)}
                        className={validationErrors[`rewards.${r.id}.name`] ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      {validationErrors[`rewards.${r.id}.name`] && (
                        <p className="text-sm text-destructive">{validationErrors[`rewards.${r.id}.name`]}</p>
                      )}
                    </div>

                    {drawMode === "WEIGHTED" ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 pl-1">
                            <Label className="text-sm">가중치</Label>
                            <span className="text-[11px] text-muted-foreground">당첨 확률 비율</span>
                          </div>
                          <Input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="가중치"
                            value={r.weight}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (!isDigitsOnly(value)) return;
                              updateReward(r.id, "weight", value);
                            }}
                            className={validationErrors[`rewards.${r.id}.weight`] ? "border-destructive focus-visible:ring-destructive" : ""}
                          />
                          {validationErrors[`rewards.${r.id}.weight`] && (
                            <p className="text-sm text-destructive">{validationErrors[`rewards.${r.id}.weight`]}</p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 pl-1">
                            <Label className="text-sm">수량</Label>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <StateToggleButton
                              checked={r.unlimited}
                              onCheckedChange={(v) => updateReward(r.id, "unlimited", v)}
                              checkedLabel="무제한"
                              uncheckedLabel="개수 지정"
                            />
                            <Input
                              type="number"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder="수량"
                              value={r.stock}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (!isDigitsOnly(value)) return;
                                updateReward(r.id, "stock", value);
                              }}
                              disabled={r.unlimited}
                              className={`flex-1 ${r.unlimited ? "opacity-50" : ""} ${validationErrors[`rewards.${r.id}.stock`] ? "border-destructive focus-visible:ring-destructive" : ""}`}
                            />
                          </div>
                          {validationErrors[`rewards.${r.id}.stock`] && (
                            <p className="text-sm text-destructive">{validationErrors[`rewards.${r.id}.stock`]}</p>
                          )}
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
                          value={r.poolCount}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!isDigitsOnly(value)) return;
                            updateReward(r.id, "poolCount", value);
                          }}
                          className={validationErrors[`rewards.${r.id}.poolCount`] ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {validationErrors[`rewards.${r.id}.poolCount`] && (
                          <p className="text-sm text-destructive">{validationErrors[`rewards.${r.id}.poolCount`]}</p>
                        )}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label className="text-sm pl-1">이미지 URL <span className="text-muted-foreground text-xs">(선택)</span></Label>
                      <div className="flex gap-3 items-start">
                        <div className="shrink-0 w-[56px] h-[56px] rounded-md border border-dashed border-border bg-muted flex items-center justify-center overflow-hidden">
                          {r.imageUrl ? (
                            <img src={r.imageUrl} alt={r.name || "보상 이미지"} className="w-full h-full object-cover" />
                          ) : (
                            <ImagePlus className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <Input
                          className="flex-1"
                          placeholder="이미지 URL (선택사항)"
                          value={r.imageUrl}
                          onChange={(e) => updateReward(r.id, "imageUrl", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2 pl-2">
                        <Checkbox
                          id={`duplicate-${r.id}`}
                          checked={r.allowDuplicateReward}
                          onCheckedChange={(checked) => updateReward(r.id, "allowDuplicateReward", !!checked)}
                        />
                        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                          <Label htmlFor={`duplicate-${r.id}`} className="text-sm cursor-pointer shrink-0">중복 당첨 허용</Label>
                          <span className="text-xs text-muted-foreground">동일 사용자가 이 보상을 여러 번 당첨받을 수 있습니다.</span>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => removeReward(r.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button variant="outline" className="gap-1.5 w-full" onClick={addReward}>
                <Plus className="h-4 w-4" /> 보상 추가
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 4: Invite codes */}
      {step === 4 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">초대 코드</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">참여자는 이 코드를 입력해 콘텐츠에 참여합니다.</p>

            {codes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">코드 없이 생성할 수 있습니다</p>
                <p className="text-xs mt-1">필요하면 아래 버튼으로 추가하고, 나중에 다시 등록해도 됩니다.</p>
              </div>
            )}

            <div className="space-y-3">
              {codes.map((c, idx) => (
                <Card key={c.id} className="border border-border bg-muted/30">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">코드 #{idx + 1}</span>
                      <Button size="icon" variant="ghost" onClick={() => removeCode(c.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">코드 <span className="text-destructive">*</span></Label>
                        <Input
                          className={`font-mono text-sm ${validationErrors[`codes.${c.id}.code`] ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          placeholder="예: ABC123"
                          value={c.code}
                          onChange={(e) => {
                            const value = e.target.value;
                            // 대문자, 소문자, 숫자, 하이픈(-), 언더스코어(_)만 허용
                            const filteredValue = value.replace(/[^A-Za-z0-9-_]/g, "");
                            updateCode(c.id, "code", filteredValue);
                          }}
                        />
                        {validationErrors[`codes.${c.id}.code`] && (
                          <p className="text-sm text-destructive">{validationErrors[`codes.${c.id}.code`]}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">참여자 이름 <span className="text-destructive">*</span></Label>
                        <Input
                          className={`text-sm ${validationErrors[`codes.${c.id}.name`] ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          placeholder="참여자 이름"
                          value={c.name}
                          onChange={(e) => updateCode(c.id, "name", e.target.value)}
                        />
                        {validationErrors[`codes.${c.id}.name`] && (
                          <p className="text-sm text-destructive">{validationErrors[`codes.${c.id}.name`]}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">허용 횟수 <span className="text-destructive">*</span></Label>
                        <Input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="1"
                          className={`text-sm ${validationErrors[`codes.${c.id}.allowedDrawCount`] ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          value={c.allowedDrawCount}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!isDigitsOnly(value)) return;
                            updateCode(c.id, "allowedDrawCount", value);
                          }}
                        />
                        {validationErrors[`codes.${c.id}.allowedDrawCount`] && (
                          <p className="text-sm text-destructive">{validationErrors[`codes.${c.id}.allowedDrawCount`]}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-[11px] text-muted-foreground">코드는 영문, 숫자 조합을 권장합니다. 중복 코드는 사용할 수 없습니다.</p>

            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" className="gap-1.5" onClick={addCode}>
                <Plus className="h-4 w-4" /> 코드 추가
              </Button>
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={importParticipantCodes}
                disabled={importingParticipantCodes}
              >
                <ListPlus className="h-4 w-4" />
                {importingParticipantCodes ? "불러오는 중..." : "리스트 추가"}
              </Button>
            </div>

            {submitError && <p className="text-sm text-destructive">{submitError}</p>}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button variant="ghost" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> 이전
        </Button>
        {step < 4 ? (
          <Button onClick={handleNext}>
            다음 <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "생성 중..." : "완료"}
          </Button>
        )}
      </div>
    </ManageLayout>
  );
};

export default CreateContent;
