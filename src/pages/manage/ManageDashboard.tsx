import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ManageLayout from "@/components/manage/ManageLayout";
import ContentCard from "@/components/manage/ContentCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { getManageContents } from "@/api/client";
import type { ManageContentResponse } from "@/api/types";
import { getContentTypeLabel } from "@/lib/contentTypeConstants";

const ManageDashboard: React.FC = () => {
  const [contents, setContents] = useState<ManageContentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    setError(null);
    getManageContents()
      .then(setContents)
      .catch((e) => setError(e.message ?? "목록을 불러오지 못했습니다"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = contents.filter((c) => typeFilter === "all" || c.type === typeFilter);
  const knownTypes = Array.from(new Set(contents.map((c) => c.type)));

  return (
    <ManageLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground">내 콘텐츠</h1>
        <Link to="/manage/create">
          <Button className="gap-1.5">
            <PlusCircle className="h-4 w-4" />
            새 콘텐츠 만들기
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36 bg-card">
            <SelectValue placeholder="콘텐츠 타입" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 타입</SelectItem>
            {knownTypes.map((t) => (
              <SelectItem key={t} value={t}>{getContentTypeLabel(t)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading && (
          <p className="text-center text-muted-foreground py-12">불러오는 중...</p>
        )}
        {!loading && error && (
          <p className="text-center text-destructive py-12">{error}</p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">표시할 콘텐츠가 없습니다</p>
        )}
        {!loading && !error && filtered.map((item) => (
          <ContentCard key={item.code} item={item} />
        ))}
      </div>
    </ManageLayout>
  );
};

export default ManageDashboard;
