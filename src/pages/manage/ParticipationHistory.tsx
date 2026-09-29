import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, ExternalLink, Inbox, Loader2, Search } from "lucide-react";
import { getMyParticipationHistories } from "@/api/client";
import type {
  PageResponse,
  ParticipationContentStatus,
  ParticipationHistory as ParticipationHistoryItem,
} from "@/api/types";
import ManageLayout from "@/components/manage/ManageLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type StatusFilter = "ALL" | ParticipationContentStatus;

const statusLabels: Record<ParticipationContentStatus, string> = {
  ACTIVE: "진행 중",
  SCHEDULED: "예정",
  ENDED: "종료",
  DELETED: "삭제됨",
};

const statusBadgeClass: Record<ParticipationContentStatus, string> = {
  ACTIVE: "bg-pink-500/15 text-pink-700 hover:bg-pink-500/20 border-0",
  SCHEDULED: "bg-sky-500/15 text-sky-700 hover:bg-sky-500/20 border-0",
  ENDED: "bg-muted text-muted-foreground hover:bg-muted border-0",
  DELETED: "bg-destructive/10 text-destructive hover:bg-destructive/15 border-0",
};

const emptyPage: PageResponse<ParticipationHistoryItem> = {
  content: [],
  number: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function formatDateTime(value: string | null): string {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDate(value: string | null): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatPeriod(startAt: string | null, endAt: string | null): string {
  if (!startAt && !endAt) return "상시";
  if (!startAt) return `~ ${formatDate(endAt)}`;
  if (!endAt) return `${formatDate(startAt)} ~`;

  return `${formatDate(startAt)} ~ ${formatDate(endAt)}`;
}

const ParticipationHistory: React.FC = () => {
  const { toast } = useToast();
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [data, setData] = useState<PageResponse<ParticipationHistoryItem>>(emptyPage);
  const [request, setRequest] = useState<{
    key: string | null;
    settled: boolean;
    error: string | null;
  }>({
    key: null,
    settled: false,
    error: null,
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const requestKey = [keyword, statusFilter, page, size].join("|");
  const loading = request.key !== requestKey || !request.settled;
  const error = request.key === requestKey ? request.error : null;

  useEffect(() => {
    let cancelled = false;

    getMyParticipationHistories({
      keyword,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      page,
      size,
    })
      .then((response) => {
        if (!cancelled) {
          setData(response);
          setRequest({ key: requestKey, settled: true, error: null });
        }
      })
      .catch((fetchError) => {
        if (!cancelled) {
          setData(emptyPage);
          setRequest({
            key: requestKey,
            settled: true,
            error: getErrorMessage(fetchError, "참여 내역을 불러오지 못했습니다."),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [keyword, page, requestKey, size, statusFilter]);

  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
    setPage(0);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as StatusFilter);
    setPage(0);
  };

  const handleSizeChange = (value: string) => {
    setSize(Number(value));
    setPage(0);
  };

  const handleCopy = async (key: string, invitationCode: string) => {
    try {
      await navigator.clipboard.writeText(invitationCode);
      setCopiedKey(key);
      toast({ description: `초대 코드가 복사되었어요: ${invitationCode}` });
      setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 1500);
    } catch {
      toast({ description: "복사에 실패했어요.", variant: "destructive" });
    }
  };

  const hasItems = data.content.length > 0;
  const currentPage = data.number + 1;
  const totalPages = Math.max(data.totalPages, 1);

  return (
    <ManageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">참여 내역</h1>
          <p className="text-sm text-muted-foreground mt-1">
            참여했던 이벤트를 확인하고 다시 방문할 수 있습니다.
          </p>
          <p className="text-sm text-pink-600 font-medium mt-2">
            총 {data.totalElements.toLocaleString("ko-KR")}개 참여
          </p>
        </div>

        <Card>
          <CardContent className="p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={handleKeywordChange}
                placeholder="콘텐츠 제목 검색"
                className="pl-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체 상태</SelectItem>
                  <SelectItem value="ACTIVE">진행 중</SelectItem>
                  <SelectItem value="SCHEDULED">예정</SelectItem>
                  <SelectItem value="ENDED">종료</SelectItem>
                  <SelectItem value="DELETED">삭제됨</SelectItem>
                </SelectContent>
              </Select>
              <Select value={String(size)} onValueChange={handleSizeChange}>
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10개씩</SelectItem>
                  <SelectItem value="20">20개씩</SelectItem>
                  <SelectItem value="50">50개씩</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="py-16 flex flex-col items-center text-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">참여 내역을 불러오는 중...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        ) : !hasItems ? (
          <Card>
            <CardContent className="py-16 flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center">
                <Inbox className="h-7 w-7 text-pink-500" />
              </div>
              <div>
                <p className="font-medium">아직 참여한 이벤트가 없습니다.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  이벤트 링크를 통해 참여하면 이곳에서 다시 확인할 수 있습니다.
                </p>
              </div>
              <Button asChild variant="outline" className="mt-2">
                <Link to="/">이벤트 둘러보기</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {data.content.map((item) => {
                const muted = item.contentStatus === "ENDED" || item.contentStatus === "DELETED";
                const copyKey = `${item.contentCode}:${item.invitationCode}`;

                return (
                  <Card
                    key={copyKey}
                    className={cn("transition-shadow hover:shadow-md", muted && "bg-muted/40 opacity-90")}
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3
                              className={cn(
                                "font-semibold text-base sm:text-lg truncate",
                                muted && "text-muted-foreground"
                              )}
                            >
                              {item.contentTitle ?? "제목 없는 콘텐츠"}
                            </h3>
                            <Badge className={statusBadgeClass[item.contentStatus]}>
                              {statusLabels[item.contentStatus]}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground pt-1">
                            <div className="flex items-center gap-1.5">
                              <span>콘텐츠 코드</span>
                              <code className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">
                                {item.contentCode}
                              </code>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span>초대 코드</span>
                              <code className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">
                                {item.invitationCode}
                              </code>
                              <button
                                type="button"
                                onClick={() => handleCopy(copyKey, item.invitationCode)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="초대 코드 복사"
                              >
                                {copiedKey === copyKey ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                            <div>최근 방문: {formatDateTime(item.accessedAt)}</div>
                            <div>기간: {formatPeriod(item.startAt, item.endAt)}</div>
                          </div>
                        </div>
                        <div className="flex sm:flex-col gap-2 sm:w-auto w-full">
                          <Button asChild size="sm" className="flex-1 sm:flex-none gap-1.5">
                            <Link to={`/draw/${item.contentCode}?code=${encodeURIComponent(item.invitationCode)}`}>
                              <ExternalLink className="h-4 w-4" />
                              이벤트 보기
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>
                {currentPage} / {totalPages} 페이지
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={data.first}
                  onClick={() => setPage((current) => Math.max(current - 1, 0))}
                >
                  이전
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={data.last}
                  onClick={() => setPage((current) => current + 1)}
                >
                  다음
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </ManageLayout>
  );
};

export default ParticipationHistory;
