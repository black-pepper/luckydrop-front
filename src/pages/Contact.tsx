import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import Footer from "@/components/Footer";
import { createInquiry } from "@/api/client";
import type { InquiryType } from "@/api/types";

const typeOptions: { value: InquiryType; label: string }[] = [
  { value: "GENERAL", label: "일반 문의" },
  { value: "BUG", label: "오류 신고" },
  { value: "FEATURE", label: "기능 제안" },
  { value: "ETC", label: "기타" },
];

const Contact = () => {
  const [type, setType] = useState<InquiryType>("GENERAL");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: { title?: string; content?: string } = {};
    if (!title.trim()) nextErrors.title = "제목을 입력해주세요.";
    if (!content.trim()) nextErrors.content = "내용을 입력해주세요.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setApiError(null);

    try {
      await createInquiry({ type, title: title.trim(), content: content.trim() });
      setType("GENERAL");
      setTitle("");
      setContent("");
      setSubmitted(true);
    } catch {
      setApiError("문의 전송에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 px-4 py-10">
        <div className="mx-auto w-full max-w-[560px]">
          <header className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight">문의하기</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              서비스 이용 중 불편한 점이나 문의사항을 남겨주세요.
            </p>
          </header>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">문의 작성</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 sm:p-8 sm:pt-0">
              {submitted && (
                <div className="mb-6 flex items-start gap-3 rounded-md border border-primary/20 bg-primary/5 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">문의가 접수되었습니다.</p>
                    <p className="mt-1 text-muted-foreground">
                      문의가 정상적으로 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.
                    </p>
                  </div>
                </div>
              )}

              {apiError && (
                <div className="mb-6 rounded-md border border-destructive/20 bg-destructive/5 p-4">
                  <p className="text-sm text-destructive">{apiError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="type">문의 유형</Label>
                  <Select value={type} onValueChange={(v) => setType(v as InquiryType)}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">
                    제목 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
                      if (submitted) setSubmitted(false);
                      if (apiError) setApiError(null);
                    }}
                    placeholder="문의 제목을 입력해주세요"
                    maxLength={100}
                    disabled={loading}
                  />
                  {errors.title && (
                    <p className="text-xs text-destructive">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">
                    내용 <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      if (errors.content) setErrors((p) => ({ ...p, content: undefined }));
                      if (submitted) setSubmitted(false);
                      if (apiError) setApiError(null);
                    }}
                    placeholder="문의 내용을 자세히 작성해주세요"
                    className="min-h-[120px]"
                    maxLength={1000}
                    disabled={loading}
                  />
                  {errors.content && (
                    <p className="text-xs text-destructive">{errors.content}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "전송 중..." : "문의 보내기"}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                긴급 문의는 이메일로 연락해주세요: support@luckydrop.app
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
