import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, ArrowLeft, Pencil, ImagePlus } from "lucide-react";
import {
  mockContents,
  mockRewards,
  mockInviteCodes,
  mockResults,
  contentTypeLabel,
  contentStatusLabel,
} from "@/data/adminMockData";

const ManageContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const content = mockContents.find((c) => c.id === id) ?? mockContents[0];
  const [copied, setCopied] = useState(false);

  const shareLink = `https://luckydrop.lovable.app/?event=${content.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link to="/admin">
            <Button size="icon" variant="ghost"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">{content.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline">{contentTypeLabel[content.type]}</Badge>
              <Badge variant={content.status === "active" ? "default" : "secondary"}>
                {contentStatusLabel[content.status]}
              </Badge>
            </div>
          </div>
        </div>

        {/* Share link */}
        <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-1.5 text-xs max-w-full overflow-hidden">
          <span className="truncate text-muted-foreground">{shareLink}</span>
          <Button size="sm" variant="ghost" className="shrink-0 h-7 px-2" onClick={handleCopy}>
            <Copy className="h-3.5 w-3.5 mr-1" />
            {copied ? "복사됨" : "복사"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="info">기본정보</TabsTrigger>
          <TabsTrigger value="rewards">보상</TabsTrigger>
          <TabsTrigger value="codes">코드</TabsTrigger>
          <TabsTrigger value="results">결과</TabsTrigger>
          <TabsTrigger value="share">공유</TabsTrigger>
        </TabsList>

        {/* ── Info ── */}
        <TabsContent value="info">
          <Card>
            <CardContent className="p-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">제목</span>
                <span className="font-medium text-foreground">{content.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">설명</span>
                <span className="text-foreground">여름 시즌 특별 이벤트</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">상태</span>
                <Badge variant={content.status === "active" ? "default" : "secondary"}>
                  {contentStatusLabel[content.status]}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Rewards ── */}
        <TabsContent value="rewards">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">보상 목록</CardTitle>
              <Button size="sm" variant="outline" className="gap-1">
                <Pencil className="h-3.5 w-3.5" /> 수정
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {mockRewards.map((r, idx) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                  {/* Thumbnail */}
                  <div className="shrink-0 w-12 h-12 rounded-md border border-dashed border-border bg-muted flex items-center justify-center overflow-hidden">
                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                    <div className="flex gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span>가중치 <span className="font-medium text-foreground">{r.weight}</span></span>
                      <span>재고 <span className="font-medium text-foreground">{r.stock}개</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Codes ── */}
        <TabsContent value="codes">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="px-5 py-2">코드</th>
                      <th className="px-5 py-2">닉네임</th>
                      <th className="px-5 py-2">메모</th>
                      <th className="px-5 py-2 text-center">남은 횟수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockInviteCodes.map((c) => (
                      <tr key={c.id} className="border-b last:border-0">
                        <td className="px-5 py-2.5 font-mono text-xs text-foreground">{c.code}</td>
                        <td className="px-5 py-2.5 text-foreground">{c.nickname || "—"}</td>
                        <td className="px-5 py-2.5 text-muted-foreground">{c.memo || "—"}</td>
                        <td className="px-5 py-2.5 text-center">
                          <Badge variant={c.remaining > 0 ? "default" : "secondary"}>{c.remaining}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Results ── */}
        <TabsContent value="results">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="px-5 py-2">코드</th>
                      <th className="px-5 py-2">보상</th>
                      <th className="px-5 py-2">시간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockResults.map((r) => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="px-5 py-2.5 font-mono text-xs text-foreground">{r.code}</td>
                        <td className="px-5 py-2.5 text-foreground">{r.reward}</td>
                        <td className="px-5 py-2.5 text-muted-foreground">{r.drawnAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Share ── */}
        <TabsContent value="share">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <Label>공유 허용</Label>
                <Switch defaultChecked />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground">참여 링크</Label>
                <div className="flex items-center gap-2">
                  <Input readOnly value={shareLink} className="text-xs" />
                  <Button size="sm" variant="outline" onClick={handleCopy}>
                    {copied ? "복사됨" : "복사"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default ManageContent;
