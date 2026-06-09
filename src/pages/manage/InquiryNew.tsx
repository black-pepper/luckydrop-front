import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ManageLayout from "@/components/manage/ManageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { inquiryTypeLabel, type InquiryType } from "@/data/inquiriesMockData";

const InquiryNew: React.FC = () => {
  const navigate = useNavigate();
  const [type, setType] = useState<InquiryType>("SERVICE");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const next: { title?: string; content?: string } = {};
    if (!title.trim()) next.title = "제목을 입력해주세요.";
    if (!content.trim()) next.content = "내용을 입력해주세요.";

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    toast({
      title: "문의가 등록되었어요",
      description: "운영자가 확인 후 답변을 등록해 드릴게요.",
    });
    navigate("/manage/inquiries");
  };

  return (
    <ManageLayout>
      <div className="mb-5">
        <Link
          to="/manage/inquiries"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          내 문의로
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-1">문의 작성</h1>
      <p className="text-sm text-muted-foreground mb-6">
        궁금한 점이나 불편한 점을 편하게 남겨주세요.
      </p>

      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="flex items-start gap-3 rounded-md bg-primary/5 border border-primary/15 p-3 text-sm">
            <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <div className="space-y-1">
              <p>문의 내용은 운영자가 확인 후 답변드릴게요.</p>
              <p className="text-muted-foreground">
                답변이 등록되면 이 화면에서 확인할 수 있어요.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="type">문의 유형</Label>
              <Select value={type} onValueChange={(v) => setType(v as InquiryType)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(inquiryTypeLabel) as InquiryType[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {inquiryTypeLabel[k]}
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
                }}
                placeholder="문의 제목을 입력해주세요"
                maxLength={100}
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
                }}
                placeholder="문의 내용을 자세히 작성해주세요"
                className="min-h-[160px]"
                maxLength={1000}
              />
              {errors.content && (
                <p className="text-xs text-destructive">{errors.content}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/manage/inquiries")}
              >
                취소
              </Button>
              <Button type="submit">등록하기</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ManageLayout>
  );
};

export default InquiryNew;
