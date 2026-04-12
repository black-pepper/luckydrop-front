import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Shuffle, ArrowLeft, ArrowRight, Gift, HelpCircle, MessageSquare, ImagePlus } from "lucide-react";
import { createAdminContent } from "@/api/client";

type ContentType = "draw" | "quiz" | "messagebox";

const typeOptions: { value: ContentType; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: "draw", label: "뽑기", icon: <Gift className="h-7 w-7" />, desc: "보상을 설정하고 참여자가 뽑기" },
  { value: "quiz", label: "퀴즈", icon: <HelpCircle className="h-7 w-7" />, desc: "정답을 맞추면 보상 지급" },
  { value: "messagebox", label: "메시지함", icon: <MessageSquare className="h-7 w-7" />, desc: "익명으로 메시지를 남기기" },
];

interface RewardRow { id: number; name: string; weight: number; stock: number; imageUrl: string }
interface CodeRow { id: number; code: string; nickname: string; memo: string; remaining: number }

const initialRewards: RewardRow[] = [
  { id: 1, name: "스타벅스 쿠폰", weight: 10, stock: 12, imageUrl: "https://placehold.co/120x120/e2e8f0/64748b?text=☕" },
  { id: 2, name: "비타500", weight: 25, stock: 54, imageUrl: "" },
  { id: 3, name: "꽝", weight: 60, stock: 999, imageUrl: "" },
];

const initialCodes: CodeRow[] = [
  { id: 1, code: "ABC123", nickname: "김철수", memo: "VIP", remaining: 3 },
];

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

  const addReward = () => setRewards((r) => [...r, { id: Date.now(), name: "", weight: 10, stock: 10, imageUrl: "" }]);
  const removeReward = (id: number) => setRewards((r) => r.filter((x) => x.id !== id));
  const updateReward = (id: number, field: keyof RewardRow, value: string | number) =>
    setRewards((r) => r.map((x) => (x.id === id ? { ...x, [field]: value } : x)));

  const addCode = () => setCodes((c) => [...c, { id: Date.now(), code: "", nickname: "", memo: "", remaining: 3 }]);
  const autoGenCodes = () => {
    const generated = Array.from({ length: 3 }, (_, i) => ({
      id: Date.now() + i,
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      nickname: "",
      memo: "자동생성",
      remaining: 3,
    }));
    setCodes((c) => [...c, ...generated]);
  };

  const canNext = () => {
    if (step === 1) return !!contentType;
    if (step === 2) return title.trim().length > 0;
    return true;
  };

  return (
    <AdminLayout>
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
              className={`cursor-pointer transition-shadow hover:shadow-md ${contentType === opt.value ? "ring-2 ring-primary" : ""}`}
              onClick={() => setContentType(opt.value)}
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
              <Label>제목</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="이벤트 제목을 입력하세요" />
            </div>
            <div className="space-y-1.5">
              <Label>설명</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="간단한 설명" />
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

      {/* Step 3: Content config (draw rewards) */}
      {step === 3 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">보상 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rewards.map((r, idx) => (
                <Card key={r.id} className="border border-border bg-muted/30">
                  <CardContent className="p-4 space-y-4">
                    {/* Header with index and delete */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">보상 #{idx + 1}</span>
                      <Button size="icon" variant="ghost" onClick={() => removeReward(r.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    {/* Reward name */}
                    <div className="space-y-1.5">
                      <Label className="text-sm">보상 이름</Label>
                      <Input
                        placeholder="예: 스타벅스 쿠폰"
                        value={r.name}
                        onChange={(e) => updateReward(r.id, "name", e.target.value)}
                      />
                    </div>

                    {/* Weight + Stock row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-sm">가중치</Label>
                        <Input
                          type="number"
                          placeholder="예: 10"
                          value={r.weight}
                          onChange={(e) => updateReward(r.id, "weight", Number(e.target.value))}
                        />
                        <p className="text-[11px] text-muted-foreground">당첨 확률 비율에 사용되는 값</p>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm">수량</Label>
                        <Input
                          type="number"
                          placeholder="예: 5"
                          value={r.stock}
                          onChange={(e) => updateReward(r.id, "stock", Number(e.target.value))}
                        />
                        <p className="text-[11px] text-muted-foreground">남아 있는 보상 개수</p>
                      </div>
                    </div>

                    {/* Image URL */}
                    <div className="space-y-1.5">
                      <Label className="text-sm">보상 이미지</Label>
                      <div className="flex gap-3 items-start">
                        {/* Thumbnail preview */}
                        <div className="shrink-0 w-[72px] h-[72px] rounded-lg border border-dashed border-border bg-muted flex items-center justify-center overflow-hidden">
                          {r.imageUrl ? (
                            <img src={r.imageUrl} alt={r.name || "보상 이미지"} className="w-full h-full object-cover" />
                          ) : (
                            <ImagePlus className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <Input
                            placeholder="이미지 URL을 입력하세요"
                            value={r.imageUrl}
                            onChange={(e) => updateReward(r.id, "imageUrl", e.target.value)}
                          />
                          <p className="text-[11px] text-muted-foreground">보상 대표 이미지 URL (선택사항)</p>
                        </div>
                      </div>
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
          <CardContent className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-2">코드</th>
                    <th className="pb-2 pr-2">닉네임</th>
                    <th className="pb-2 pr-2">메모</th>
                    <th className="pb-2 pr-2 text-center">남은 횟수</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((c) => (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="py-2 pr-2 font-mono text-xs">{c.code || "—"}</td>
                      <td className="py-2 pr-2">{c.nickname || "—"}</td>
                      <td className="py-2 pr-2 text-muted-foreground">{c.memo || "—"}</td>
                      <td className="py-2 pr-2 text-center">{c.remaining}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" className="gap-1.5" onClick={addCode}>
                <Plus className="h-4 w-4" /> 코드 추가
              </Button>
              <Button variant="outline" className="gap-1.5" onClick={autoGenCodes}>
                <Shuffle className="h-4 w-4" /> 코드 자동 생성
              </Button>
            </div>
            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}
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
          <Button
            onClick={async () => {
              if (!contentType) return;
              setSubmitting(true);
              setSubmitError(null);
              try {
                await createAdminContent({
                  type: contentType,
                  title: title.trim(),
                  description: description.trim(),
                });
                navigate("/admin");
              } catch (e: any) {
                setSubmitError(e.message ?? "콘텐츠 생성에 실패했습니다");
                setSubmitting(false);
              }
            }}
            disabled={submitting}
          >
            {submitting ? "생성 중..." : "완료"}
          </Button>
        )}
      </div>
    </AdminLayout>
  );
};

export default CreateContent;
