import React from "react";
import { Link, useParams } from "react-router-dom";
import ManageLayout from "@/components/manage/ManageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Clock, MessageCircle, User } from "lucide-react";
import {
  mockInquiries,
  inquiryTypeLabel,
  inquiryStatusLabel,
  formatInquiryDate,
} from "@/data/inquiriesMockData";

const InquiryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const inquiry = mockInquiries.find((i) => String(i.id) === id);

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

  const answered = inquiry.status === "ANSWERED";

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
            variant={answered ? "default" : "secondary"}
            className={answered ? "" : "bg-muted text-muted-foreground hover:bg-muted"}
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

      {answered && inquiry.answer ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <span>{inquiry.answer.author}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatInquiryDate(inquiry.answer.answeredAt)}
              </span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {inquiry.answer.content}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium mb-1">아직 답변이 등록되지 않았어요</p>
            <p className="text-xs text-muted-foreground">
              운영자가 확인 중이에요. 조금만 기다려주세요.
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
