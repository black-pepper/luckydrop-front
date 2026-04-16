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
import { Trash2, Plus, Shuffle, ArrowLeft, ArrowRight, Gift, HelpCircle, MessageSquare, ImagePlus } from "lucide-react";
import { createManageContent, createManageReward, createManageInvitationCode } from "@/api/client";
import { generateCode } from "@/lib/utils";
import type { ContentType } from "@/data/manageMockData";

const typeOptions: { value: ContentType; label: string; icon: React.ReactNode; desc: string; disabled?: boolean }[] = [
  { value: "draw", label: "뽑기", icon: <Gift className="h-7 w-7" />, desc: "보상을 설정하고 참여자가 뽑기" },
  { value: "quiz", label: "퀴즈", icon: <HelpCircle className="h-7 w-7" />, desc: "준비 중인 기능입니다", disabled: true },
  { value: "messagebox", label: "메시지함", icon: <MessageSquare className="h-7 w-7" />, desc: "준비 중인 기능입니다", disabled: true },
];

interface RewardRow {
  id: number;
  name: string;
  weight: number;
  stock: number;
  imageUrl: string;
  unlimited: boolean;
  allowDuplicateReward: boolean;
  active: boolean;
}
interface CodeRow { id: number; code: string; name: string; allowedDrawCount: number }

const initialRewards: RewardRow[] = [
  { id: 1, name: "스타벅스 쿠폰", weight: 10, stock: 12, imageUrl: "https://placehold.co/120x120/e2e8f0/64748b?text=☕", unlimited: false, allowDuplicateReward: false, active: true },
  { id: 2, name: "비타500", weight: 25, stock: 54, imageUrl: "", unlimited: false, allowDuplicateReward: false, active: true },
  { id: 3, name: "꽝", weight: 60, stock: 999, imageUrl: "", unlimited: true, allowDuplicateReward: false, active: true },
];

const initialCodes: CodeRow[] = [];

const CreateContent: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [shareResult, setShareResult] = useState(false);
  const [rewards, setRewards] = useState<RewardRow[]>(initialRewards);
  const [codes, setCodes] = useState<CodeRow[]>(initialCodes);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const addReward = () =>
    setRewards((r) => [...r, { id: Date.now(), name: "", weight: 10, stock: 10, imageUrl: "", unlimited: true, allowDuplicateReward: false, active: true }]);
  const removeReward = (id: number) => setRewards((r) => r.filter((x) => x.id !== id));
  const updateReward = (id: number, field: keyof RewardRow, value: string | number | boolean) =>
    setRewards((r) => r.map((x) => (x.id === id ? { ...x, [field]: value } : x)));

  const addCode = () => setCodes((c) => [...c, { id: Date.now(), code: "", name: "", allowedDrawCount: 1 }]);
  const removeCode = (id: number) => setCodes((c) => c.filter((x) => x.id !== id));
  const updateCode = (id: number, field: keyof CodeRow, value: string | number) =>
    setCodes((c) => c.map((x) => (x.id === id ? { ...x, [field]: value } : x)));
  const autoGenCodes = () => {
    const generated = Array.from({ length: 3 }, (_, i) => ({
      id: Date.now() + i,
      code: generateCode(),
      name: "",
      allowedDrawCount: 1,
    }));
    setCodes((c) => [...c, ...generated]);
  };

  const canNext = () => {
    if (step === 1) return !!contentType;
    if (step === 2) return title.trim().length > 0 && description.trim().length > 0;
    if (step === 4) return codes.every((c) => c.code.trim().length > 0 && c.name.trim().length > 0);
    return true;
  };

  const handleSubmit = async () => {
    if (!contentType) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createManageContent({
        type: contentType,
        title: title.trim(),
        description: description.trim(),
      });
      await Promise.all(
        rewards.map((r) =>
          createManageReward({
            contentCode: created.code,
            name: r.name,
            weight: r.weight,
            stock: r.unlimited ? undefined : r.stock,
            imageUrl: r.imageUrl || undefined,
            allowDuplicateReward: r.allowDuplicateReward,
            active: r.active,
          })
        )
      );
      await Promise.all(
        codes
          .filter((c) => c.code.trim().length > 0)
          .map((c) =>
            createManageInvitationCode({
              contentCode: created.code,
              code: c.code.trim(),
              name: c.name || undefined,
              allowedDrawCount: c.allowedDrawCount,
              active: true,
            })
          )
      );
      navigate("/manage");
    } catch (e: any) {
      setSubmitError(e.message ?? "콘텐츠 생성에 실패했습니다");
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
      </div>

      {/* Step 1: Type */}
      {step === 1 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {typeOptions.map((opt) => (
            <Card
              key={opt.value}
              className={`transition-shadow ${opt.disabled ? "opacity-50 cursor-not-allowed bg-muted/50" : "cursor-pointer hover:shadow-md"} ${contentType === opt.value ? "ring-2 ring-primary" : ""}`}
              onClick={() => !opt.disabled && setContentType(opt.value)}
            >
              <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
                <div className={`${opt.disabled ? "text-muted-foreground" : "text-primary"}`}>{opt.icon}</div>
                <h3 className="font-semibold text-foreground">{opt.label}</h3>
                <p className="text-xs text-muted-foreground">{opt.desc}</p>
                {opt.disabled && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground mt-1">Coming Soon</span>}
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
              <Label>제목</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="이벤트 제목을 입력하세요" />
            </div>
            <div className="space-y-1.5">
              <Label>설명 <span className="text-destructive">*</span></Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="간단한 설명을 입력하세요" />
            </div>
            <div className="flex items-center justify-between">
              <Label>공개 여부</Label>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
            <div className="flex items-center justify-between">
              <Label>결과 공유 허용</Label>
              <Switch checked={shareResult} onCheckedChange={setShareResult} />
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
                      <Label className="text-sm pl-1">보상 이름</Label>
                      <Input
                        placeholder="예: 스타벅스 쿠폰"
                        value={r.name}
                        onChange={(e) => updateReward(r.id, "name", e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 pl-1">
                          <Label className="text-sm">가중치</Label>
                          <span className="text-[11px] text-muted-foreground">당첨 확률 비율</span>
                        </div>
                        <Input
                          type="number"
                          placeholder="가중치"
                          value={r.weight}
                          onChange={(e) => updateReward(r.id, "weight", Number(e.target.value))}
                        />
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
                            placeholder="수량"
                            value={r.stock}
                            onChange={(e) => updateReward(r.id, "stock", Number(e.target.value))}
                            disabled={r.unlimited}
                            className={`flex-1 ${r.unlimited ? "opacity-50" : ""}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm pl-1">이미지 URL</Label>
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
                        <Label htmlFor={`duplicate-${r.id}`} className="text-sm cursor-pointer">중복 당첨 허용</Label>
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
                <p className="text-sm">코드를 추가해주세요</p>
                <p className="text-xs mt-1">아래 버튼으로 직접 추가하거나 자동 생성할 수 있습니다.</p>
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
                        <Label className="text-xs">코드</Label>
                        <Input
                          className="font-mono text-sm"
                          placeholder="예: ABC123"
                          value={c.code}
                          onChange={(e) => updateCode(c.id, "code", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">참여자 이름 <span className="text-destructive">*</span></Label>
                        <Input
                          className="text-sm"
                          placeholder="참여자 이름"
                          value={c.name}
                          onChange={(e) => updateCode(c.id, "name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">허용 횟수</Label>
                        <Input
                          type="number"
                          className="text-sm"
                          value={c.allowedDrawCount}
                          onChange={(e) => updateCode(c.id, "allowedDrawCount", Number(e.target.value))}
                        />
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
              <Button variant="outline" className="gap-1.5" onClick={autoGenCodes}>
                <Shuffle className="h-4 w-4" /> 코드 자동 생성
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
          <Button disabled={!canNext()} onClick={() => setStep((s) => s + 1)}>
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
