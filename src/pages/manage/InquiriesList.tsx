import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ManageLayout from "@/components/manage/ManageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MessageSquarePlus, ChevronRight, MessageCircle, Loader2 } from "lucide-react";
import { getUserInquiries } from "@/api/client";
import type { UserInquiry } from "@/api/types";
import {
  inquiryTypeLabel,
  inquiryStatusLabel,
  formatInquiryDate,
} from "@/data/inquiriesMockData";

const InquiriesList: React.FC = () => {
  const [inquiries, setInquiries] = useState<UserInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getUserInquiries()
      .then((items) =>
        setInquiries([...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
      )
      .catch((e) => setError(e.message ?? "문의 목록을 불러오지 못했습니다"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ManageLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">내 문의</h1>
          <p className="text-sm text-muted-foreground mt-1">
            내가 보낸 문의와 답변 상태를 한 곳에서 확인할 수 있어요.
          </p>
        </div>
        <Link to="/manage/inquiries/new">
          <Button className="gap-1.5">
            <PlusCircle className="h-4 w-4" />
            문의 작성
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card className="p-10 flex flex-col items-center text-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">문의 목록을 불러오는 중...</p>
        </Card>
      ) : error ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      ) : inquiries.length === 0 ? (
        <Card className="p-10 flex flex-col items-center text-center gap-3 border-dashed">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquarePlus className="h-7 w-7 text-primary" />
          </div>
          <p className="text-base font-medium">아직 작성한 문의가 없어요</p>
          <p className="text-sm text-muted-foreground">
            궁금한 점이 있다면 언제든 문의를 남겨주세요
          </p>
          <Link to="/manage/inquiries/new" className="mt-2">
            <Button>문의 작성하기</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {inquiries.map((item) => {
            const done = item.status === "DONE";

            return (
              <Link key={item.id} to={`/manage/inquiries/${item.id}`}>
                <Card className="p-4 sm:p-5 hover:border-primary/40 hover:shadow-sm transition-all group">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <Badge
                          variant={done ? "default" : "secondary"}
                          className={
                            done
                              ? ""
                              : "bg-muted text-muted-foreground hover:bg-muted"
                          }
                        >
                          {done ? (
                            <MessageCircle className="h-3 w-3 mr-1" />
                          ) : null}
                          {inquiryStatusLabel[item.status]}
                        </Badge>
                        <Badge variant="outline" className="font-normal">
                          {inquiryTypeLabel[item.type]}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground truncate">
                        {item.title}
                      </h3>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-xs text-muted-foreground">
                        <span>작성일 {formatInquiryDate(item.createdAt)}</span>
                        {item.answeredAt && (
                          <span>답변일 {formatInquiryDate(item.answeredAt)}</span>
                        )}
                      </div>
                      {item.answer && (
                        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                          {item.answer}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/60 group-hover:text-primary shrink-0 mt-1" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </ManageLayout>
  );
};

export default InquiriesList;
