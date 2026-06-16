import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, ExternalLink, Inbox, Search, Trophy } from "lucide-react";
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
import {
  formatHistoryDate,
  formatPeriod,
  mockParticipationHistory,
  type ParticipationHistoryItem,
} from "@/data/participationHistoryMockData";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type SortOrder = "RECENT" | "OLDEST";
type StatusFilter = "ALL" | "ONGOING" | "ENDED";

const ParticipationHistory: React.FC = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOrder>("RECENT");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalCount = mockParticipationHistory.length;

  const items = useMemo(() => {
    let list: ParticipationHistoryItem[] = [...mockParticipationHistory];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((item) => item.eventTitle.toLowerCase().includes(q));
    }

    if (statusFilter !== "ALL") {
      list = list.filter((item) => item.status === statusFilter);
    }

    list.sort((a, b) => {
      const da = new Date(a.lastVisitedAt).getTime();
      const db = new Date(b.lastVisitedAt).getTime();

      return sort === "RECENT" ? db - da : da - db;
    });

    return list;
  }, [query, sort, statusFilter]);

  const handleCopy = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      toast({ description: `참여 코드가 복사되었어요: ${code}` });
      setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1500);
    } catch {
      toast({ description: "복사에 실패했어요.", variant: "destructive" });
    }
  };

  return (
    <ManageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">참여 내역</h1>
          <p className="text-sm text-muted-foreground mt-1">
            참여했던 이벤트를 확인하고 다시 방문할 수 있습니다.
          </p>
          <p className="text-sm text-pink-600 font-medium mt-2">총 {totalCount}개 참여</p>
        </div>

        <Card>
          <CardContent className="p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="이벤트명 검색"
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as StatusFilter)}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체 상태</SelectItem>
                  <SelectItem value="ONGOING">진행 중</SelectItem>
                  <SelectItem value="ENDED">종료됨</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={(value) => setSort(value as SortOrder)}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RECENT">최근 참여순</SelectItem>
                  <SelectItem value="OLDEST">오래된 순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {items.length === 0 ? (
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
          <div className="space-y-3">
            {items.map((item) => {
              const ended = item.status === "ENDED";

              return (
                <Card
                  key={item.id}
                  className={cn("transition-shadow hover:shadow-md", ended && "bg-muted/40 opacity-90")}
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className={cn(
                              "font-semibold text-base sm:text-lg truncate",
                              ended && "text-muted-foreground"
                            )}
                          >
                            {item.eventTitle}
                          </h3>
                          {ended ? (
                            <Badge variant="secondary">종료됨</Badge>
                          ) : (
                            <Badge className="bg-pink-500/15 text-pink-700 hover:bg-pink-500/20 border-0">
                              진행 중
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground pt-1">
                          <div className="flex items-center gap-1.5">
                            <span>참여 코드</span>
                            <code className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded">
                              {item.code}
                            </code>
                            <button
                              type="button"
                              onClick={() => handleCopy(item.id, item.code)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              aria-label="참여 코드 복사"
                            >
                              {copiedId === item.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                          <div>최근 방문: {formatHistoryDate(item.lastVisitedAt)}</div>
                          <div>기간: {formatPeriod(item.periodStart, item.periodEnd)}</div>
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2 sm:w-auto w-full">
                        <Button asChild size="sm" className="flex-1 sm:flex-none gap-1.5">
                          <Link to={`/draw/${item.code}`}>
                            <ExternalLink className="h-4 w-4" />
                            이벤트 보기
                          </Link>
                        </Button>
                        {item.hasResult && (
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="flex-1 sm:flex-none gap-1.5"
                          >
                            <Link to={`/draw/${item.code}`}>
                              <Trophy className="h-4 w-4" />
                              결과 보기
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ManageLayout>
  );
};

export default ParticipationHistory;
