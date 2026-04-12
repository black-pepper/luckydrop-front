import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, ArrowLeft } from "lucide-react";
import {
  getAdminContentDetail,
  updateAdminContent,
  deleteAdminContent,
  getAdminRewardsByContent,
  createAdminReward,
  updateAdminReward,
  deleteAdminReward,
} from "@/api/client";
import type { AdminContentDetailResponse, AdminRewardResponse } from "@/api/types";

const typeLabel: Record<string, string> = {
  draw: "뽑기",
  quiz: "퀴즈",
  messagebox: "메시지함",
};

const emptyRewardForm = {
  name: "",
  description: "",
  weight: 1,
  stock: 0,
  allowDuplicateReward: false,
};

const ManageContent: React.FC = () => {
  const { contentCode } = useParams<{ contentCode: string }>();
  const navigate = useNavigate();

  const [content, setContent] = useState<AdminContentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Edit state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Delete state
  const [deleting, setDeleting] = useState(false);

  // Rewards state
  const [rewards, setRewards] = useState<AdminRewardResponse[]>([]);
  const [rewardsLoading, setRewardsLoading] = useState(false);
  const [rewardsError, setRewardsError] = useState<string | null>(null);

  // Add reward form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(emptyRewardForm);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit reward state
  const [editingRewardId, setEditingRewardId] = useState<number | null>(null);
  const [editRewardForm, setEditRewardForm] = useState(emptyRewardForm);
  const [editingReward, setEditingReward] = useState(false);
  const [editRewardError, setEditRewardError] = useState<string | null>(null);

  useEffect(() => {
    if (!contentCode) return;
    setLoading(true);
    setError(null);
    getAdminContentDetail(contentCode)
      .then((data) => {
        setContent(data);
        setEditTitle(data.title);
        setEditDescription(data.description);
        setEditType(data.type);
      })
      .catch((e) => setError(e.message ?? "콘텐츠를 불러오지 못했습니다"))
      .finally(() => setLoading(false));
  }, [contentCode]);

  // Fetch rewards using contentCode
  useEffect(() => {
    if (!contentCode) return;
    setRewardsLoading(true);
    setRewardsError(null);
    getAdminRewardsByContent(contentCode)
      .then(setRewards)
      .catch((e) => setRewardsError(e.message ?? "보상 목록을 불러오지 못했습니다"))
      .finally(() => setRewardsLoading(false));
  }, [contentCode]);

  const shareLink = `${window.location.origin}/draw?contentCode=${contentCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSave = async () => {
    if (!contentCode) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const updated = await updateAdminContent(contentCode, {
        type: editType,
        title: editTitle,
        description: editDescription,
      });
      setContent({ ...updated, createdAt: content?.createdAt ?? updated.createdAt });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e: any) {
      setSaveError(e.message ?? "저장에 실패했습니다");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!contentCode) return;
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    setDeleting(true);
    try {
      await deleteAdminContent(contentCode);
      navigate("/admin");
    } catch (e: any) {
      alert(e.message ?? "삭제에 실패했습니다");
      setDeleting(false);
    }
  };

  // ── Reward handlers ────────────────────────────────────────────────────────

  const handleAddReward = async () => {
    if (!contentCode) return;
    setAdding(true);
    setAddError(null);
    try {
      const created = await createAdminReward({ ...addForm, contentCode });
      setRewards((prev) => [...prev, created]);
      setShowAddForm(false);
      setAddForm(emptyRewardForm);
    } catch (e: any) {
      setAddError(e.message ?? "보상 추가에 실패했습니다");
    } finally {
      setAdding(false);
    }
  };

  const startEditReward = (reward: AdminRewardResponse) => {
    setEditingRewardId(reward.id);
    setEditRewardForm({
      name: reward.name,
      description: reward.description ?? "",
      weight: reward.weight,
      stock: reward.stock ?? 0,
      allowDuplicateReward: reward.allowDuplicateReward,
    });
    setEditRewardError(null);
  };

  const handleUpdateReward = async () => {
    if (editingRewardId == null) return;
    setEditingReward(true);
    setEditRewardError(null);
    try {
      const updated = await updateAdminReward(editingRewardId, editRewardForm);
      setRewards((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setEditingRewardId(null);
    } catch (e: any) {
      setEditRewardError(e.message ?? "수정에 실패했습니다");
    } finally {
      setEditingReward(false);
    }
  };

  const handleDeleteReward = async (rewardId: number) => {
    if (!window.confirm("보상을 삭제하시겠습니까?")) return;
    try {
      await deleteAdminReward(rewardId);
      setRewards((prev) => prev.filter((r) => r.id !== rewardId));
    } catch (e: any) {
      alert(e.message ?? "삭제에 실패했습니다");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-center text-muted-foreground py-20">불러오는 중...</p>
      </AdminLayout>
    );
  }

  if (error || !content) {
    return (
      <AdminLayout>
        <p className="text-center text-destructive py-20">{error ?? "콘텐츠를 찾을 수 없습니다"}</p>
      </AdminLayout>
    );
  }

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
              <Badge variant="outline">{typeLabel[content.type] ?? content.type}</Badge>
              <span className="text-xs text-muted-foreground font-mono">{content.code}</span>
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
          <TabsTrigger value="rewards">보상 관리</TabsTrigger>
          <TabsTrigger value="share">공유</TabsTrigger>
        </TabsList>

        {/* ── Info ── */}
        <TabsContent value="info">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">기본 정보 수정</CardTitle>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "삭제 중..." : "삭제"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>타입</Label>
                <Input value={editType} onChange={(e) => setEditType(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>제목</Label>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>설명</Label>
                <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "저장 중..." : "저장"}
                </Button>
                {saveSuccess && <span className="text-sm text-green-600">저장되었습니다</span>}
                {saveError && <span className="text-sm text-destructive">{saveError}</span>}
              </div>
              <div className="pt-2 text-xs text-muted-foreground space-y-1">
                <p>콘텐츠 코드: <span className="font-mono">{content.code}</span></p>
                <p>생성일: {new Date(content.createdAt).toLocaleString("ko-KR")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Rewards ── */}
        <TabsContent value="rewards">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">보상 목록</CardTitle>
              <Button
                size="sm"
                onClick={() => { setShowAddForm(true); setAddError(null); }}
                disabled={showAddForm}
              >
                추가
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Add form */}
              {showAddForm && (
                <div className="border rounded-md p-3 space-y-3 bg-muted/40">
                  <p className="text-sm font-medium">새 보상 추가</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">이름 *</Label>
                      <Input
                        value={addForm.name}
                        onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="보상 이름"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">설명</Label>
                      <Input
                        value={addForm.description}
                        onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
                        placeholder="보상 설명"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">가중치 *</Label>
                      <Input
                        type="number"
                        min={1}
                        value={addForm.weight}
                        onChange={(e) => setAddForm((f) => ({ ...f, weight: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">재고</Label>
                      <Input
                        type="number"
                        min={0}
                        value={addForm.stock}
                        onChange={(e) => setAddForm((f) => ({ ...f, stock: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addForm.allowDuplicateReward}
                      onChange={(e) => setAddForm((f) => ({ ...f, allowDuplicateReward: e.target.checked }))}
                    />
                    중복 당첨 허용
                  </label>
                  {addError && <p className="text-sm text-destructive">{addError}</p>}
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddReward} disabled={adding}>
                      {adding ? "저장 중..." : "저장"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setShowAddForm(false); setAddForm(emptyRewardForm); setAddError(null); }}
                      disabled={adding}
                    >
                      취소
                    </Button>
                  </div>
                </div>
              )}

              {/* Reward list */}
              {rewardsLoading && (
                <p className="text-center text-muted-foreground py-6 text-sm">불러오는 중...</p>
              )}
              {!rewardsLoading && rewardsError && (
                <p className="text-center text-destructive py-6 text-sm">{rewardsError}</p>
              )}
              {!rewardsLoading && !rewardsError && rewards.length === 0 && (
                <p className="text-center text-muted-foreground py-6 text-sm">등록된 보상이 없습니다</p>
              )}
              {!rewardsLoading && rewards.map((reward) =>
                editingRewardId === reward.id ? (
                  // Inline edit form
                  <div key={reward.id} className="border rounded-md p-3 space-y-3 bg-muted/40">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">이름 *</Label>
                        <Input
                          value={editRewardForm.name}
                          onChange={(e) => setEditRewardForm((f) => ({ ...f, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">설명</Label>
                        <Input
                          value={editRewardForm.description}
                          onChange={(e) => setEditRewardForm((f) => ({ ...f, description: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">가중치 *</Label>
                        <Input
                          type="number"
                          min={1}
                          value={editRewardForm.weight}
                          onChange={(e) => setEditRewardForm((f) => ({ ...f, weight: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">재고</Label>
                        <Input
                          type="number"
                          min={0}
                          value={editRewardForm.stock}
                          onChange={(e) => setEditRewardForm((f) => ({ ...f, stock: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editRewardForm.allowDuplicateReward}
                        onChange={(e) => setEditRewardForm((f) => ({ ...f, allowDuplicateReward: e.target.checked }))}
                      />
                      중복 당첨 허용
                    </label>
                    {editRewardError && <p className="text-sm text-destructive">{editRewardError}</p>}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleUpdateReward} disabled={editingReward}>
                        {editingReward ? "저장 중..." : "저장"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditingRewardId(null); setEditRewardError(null); }}
                        disabled={editingReward}
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Reward row
                  <div
                    key={reward.id}
                    className="flex items-center justify-between border rounded-md px-3 py-2 text-sm"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{reward.name}</p>
                        {!reward.active && (
                          <Badge variant="secondary" className="text-xs shrink-0">비활성</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        가중치 {reward.weight}
                        {reward.stock != null ? ` · 재고 ${reward.stock}` : ""}
                        {reward.allowDuplicateReward ? " · 중복 허용" : ""}
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0 ml-3">
                      <Button size="sm" variant="outline" onClick={() => startEditReward(reward)}>
                        수정
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteReward(reward.id)}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Share ── */}
        <TabsContent value="share">
          <Card>
            <CardContent className="p-5 space-y-4">
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
