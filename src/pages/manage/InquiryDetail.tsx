import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ManageLayout from "@/components/manage/ManageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Clock, Loader2, MessageCircle, User } from "lucide-react";
import { ApiError, getUserInquiry } from "@/api/client";
import type { UserInquiry } from "@/api/types";
import {
  inquiryTypeLabel,
  inquiryStatusLabel,
  formatInquiryDate,
} from "@/data/inquiriesMockData";

const InquiryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [inquiry, setInquiry] = useState<UserInquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const inquiryId = Number(id);
    if (!Number.isInteger(inquiryId)) {
      setInquiry(null);
      setLoading(false);
      return;
    }

    getUserInquiry(inquiryId)
      .then(setInquiry)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 404) {
          setInquiry(null);
          return;
        }
        setError(e.message ?? "문의 정보를 불러오지 못했습니다");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <ManageLayout>
        <Card className="p-10 flex flex-col items-center text-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">문의 정보를 불러오는 중...</p>
        </Card>
      </ManageLayout>
    );
  }

  if (error) {
    return (
      <ManageLayout>
        <Card className="p-10 text-center">
          <p className="text-sm text-destructive mb-4">{error}</p>
          <Link to="/manage/inquiries">
            <Button variant="outline">목록으로</Button>
          </Link>
        </Card>
      </ManageLayout>
    );
  }

  if (!inquiry) {
    return (
      <ManageLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">존재하지 않는 문의입니다.</p>
          <Link to="/manage/inquiries">
            <Button variant="outline">목록으로</Button>
          </Link>
        </div>
      </ManageLayout>
    );
  }

  const done = inquiry.status === "DONE";

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

      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge
            variant={done ? "default" : "secondary"}
            className={done ? "" : "bg-muted text-muted-foreground hover:bg-muted"}
          >
            {inquiryStatusLabel[inquiry.status]}
          </Badge>
          <Badge variant="outline" className="font-normal">
            {inquiryTypeLabel[inquiry.type]}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold text-foreground">{inquiry.title}</h1>
        <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          작성일 {formatInquiryDate(inquiry.createdAt)}
        </p>
      </div>

      <Card className="mb-4">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium">
            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span>나의 문의</span>
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {inquiry.content}
          </p>
        </CardContent>
      </Card>

      {done && inquiry.answer ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <span>운영팀 답변</span>
              </div>
              {inquiry.answeredAt && (
                <span className="text-xs text-muted-foreground">
                  {formatInquiryDate(inquiry.answeredAt)}
                </span>
              )}
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {inquiry.answer}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium mb-1">아직 처리 중인 문의입니다</p>
            <p className="text-xs text-muted-foreground">
              운영팀이 내용을 확인하고 있어요. 조금만 기다려주세요.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex justify-center">
        <Link to="/manage/inquiries">
          <Button variant="outline">목록으로</Button>
        </Link>
      </div>
    </ManageLayout>
  );
};

export default InquiryDetail;
