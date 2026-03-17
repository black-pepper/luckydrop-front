import React, { useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import ContentCard from "@/components/admin/ContentCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { mockContents, contentTypeLabel, contentStatusLabel } from "@/data/adminMockData";
import type { ContentType, ContentStatus } from "@/data/adminMockData";

const AdminDashboard: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState<ContentType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");

  const filtered = mockContents.filter((c) => {
    if (typeFilter !== "all" && c.type !== typeFilter) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    return true;
  });

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground">내 콘텐츠</h1>
        <Link to="/admin/create">
          <Button className="gap-1.5">
            <PlusCircle className="h-4 w-4" />
            새 콘텐츠 만들기
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
          <SelectTrigger className="w-36 bg-card">
            <SelectValue placeholder="콘텐츠 타입" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 타입</SelectItem>
            {(Object.keys(contentTypeLabel) as ContentType[]).map((k) => (
              <SelectItem key={k} value={k}>{contentTypeLabel[k]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-36 bg-card">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            {(Object.keys(contentStatusLabel) as ContentStatus[]).map((k) => (
              <SelectItem key={k} value={k}>{contentStatusLabel[k]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">표시할 콘텐츠가 없습니다</p>
        ) : (
          filtered.map((item) => <ContentCard key={item.id} item={item} />)
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
