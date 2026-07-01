import React, { useEffect, useMemo, useState } from "react";
import ManageLayout from "@/components/manage/ManageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  createManageParticipantCode,
  createManageParticipantCodesBatch,
  deleteManageParticipantCode,
  getManageParticipantCodes,
  updateManageParticipantCode,
} from "@/api/client";
import type { ManageParticipantCodeResponse } from "@/api/types";
import { Check, Clipboard, Pencil, Plus, RefreshCw, Save, Search, Trash2, X } from "lucide-react";

interface ParticipantForm {
  participantName: string;
  memo: string;
}

const emptyForm: ParticipantForm = {
  participantName: "",
  memo: "",
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message;
  return fallback;
};

const parseBatchText = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ...memoParts] = line.split(/\t|,/);
      return {
        participantName: name.trim(),
        memo: memoParts.join(",").trim(),
      };
    })
    .filter((item) => item.participantName.length > 0);

const ParticipantCodes: React.FC = () => {
  const { toast } = useToast();
  const [participantCodes, setParticipantCodes] = useState<ManageParticipantCodeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");

  const [form, setForm] = useState<ParticipantForm>(emptyForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [batchText, setBatchText] = useState("");
  const [batchCreating, setBatchCreating] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ParticipantForm>(emptyForm);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const loadParticipantCodes = () => {
    setLoading(true);
    setError(null);
    getManageParticipantCodes()
      .then(setParticipantCodes)
      .catch((e) => setError(getErrorMessage(e, "참여자 리스트를 불러오지 못했습니다")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadParticipantCodes();
  }, []);

  const filtered = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return participantCodes;
    return participantCodes.filter((item) =>
      [item.code, item.participantName, item.memo ?? ""].some((value) =>
        value.toLowerCase().includes(normalized)
      )
    );
  }, [keyword, participantCodes]);

  const batchItems = useMemo(() => parseBatchText(batchText), [batchText]);

  const handleCreate = async () => {
    if (!form.participantName.trim()) {
      setCreateError("참여자 이름을 입력해주세요.");
      return;
    }

    setCreating(true);
    setCreateError(null);
    try {
      const created = await createManageParticipantCode({
        participantName: form.participantName.trim(),
        memo: form.memo.trim() || undefined,
      });
      setParticipantCodes((prev) => [created, ...prev]);
      setForm(emptyForm);
      toast({ title: "참여자를 추가했습니다" });
    } catch (e) {
      setCreateError(getErrorMessage(e, "참여자 추가에 실패했습니다"));
    } finally {
      setCreating(false);
    }
  };

  const handleBatchCreate = async () => {
    if (batchItems.length === 0) {
      setBatchError("한 줄에 한 명씩 입력해주세요.");
      return;
    }

    setBatchCreating(true);
    setBatchError(null);
    try {
      const created = await createManageParticipantCodesBatch({ participantCodes: batchItems });
      setParticipantCodes((prev) => [...created, ...prev]);
      setBatchText("");
      toast({ title: `${created.length}명을 추가했습니다` });
    } catch (e) {
      setBatchError(getErrorMessage(e, "참여자 일괄 추가에 실패했습니다"));
    } finally {
      setBatchCreating(false);
    }
  };

  const startEdit = (item: ManageParticipantCodeResponse) => {
    setEditingId(item.id);
    setEditForm({
      participantName: item.participantName,
      memo: item.memo ?? "",
    });
  };

  const handleUpdate = async (id: number) => {
    if (!editForm.participantName.trim()) return;

    setSavingId(id);
    try {
      const updated = await updateManageParticipantCode(id, {
        participantName: editForm.participantName.trim(),
        memo: editForm.memo.trim() || undefined,
      });
      setParticipantCodes((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setEditingId(null);
      toast({ title: "수정했습니다" });
    } catch (e) {
      toast({
        title: "수정에 실패했습니다",
        description: getErrorMessage(e, "잠시 후 다시 시도해주세요"),
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("참여자 추천코드를 삭제하시겠습니까?")) return;

    try {
      await deleteManageParticipantCode(id);
      setParticipantCodes((prev) => prev.filter((item) => item.id !== id));
      toast({ title: "삭제했습니다" });
    } catch (e) {
      toast({
        title: "삭제에 실패했습니다",
        description: getErrorMessage(e, "잠시 후 다시 시도해주세요"),
        variant: "destructive",
      });
    }
  };

  const handleCopy = (item: ManageParticipantCodeResponse) => {
    navigator.clipboard.writeText(item.code).catch(() => {});
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <ManageLayout>
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl font-bold text-foreground">참여자 리스트 관리</h1>
        <p className="text-sm text-muted-foreground">
          참여자별 추천코드를 미리 생성하고, 콘텐츠 초대 코드 단계에서 불러올 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4 items-start">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-base">추천코드 목록</CardTitle>
                <div className="flex gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-8"
                      placeholder="이름, 코드, 메모 검색"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                  </div>
                  <Button size="icon" variant="outline" onClick={loadParticipantCodes} aria-label="새로고침">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading && <p className="text-center text-muted-foreground py-10">불러오는 중...</p>}
              {!loading && error && <p className="text-center text-destructive py-10">{error}</p>}
              {!loading && !error && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32">코드</TableHead>
                      <TableHead className="w-44">참여자 이름</TableHead>
                      <TableHead>메모</TableHead>
                      <TableHead className="w-32 text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                          표시할 참여자가 없습니다
                        </TableCell>
                      </TableRow>
                    )}
                    {filtered.map((item) =>
                      editingId === item.id ? (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-xs">{item.code}</TableCell>
                          <TableCell>
                            <Input
                              value={editForm.participantName}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, participantName: e.target.value }))}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editForm.memo}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, memo: e.target.value }))}
                              placeholder="메모"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => handleUpdate(item.id)}
                                disabled={savingId === item.id}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-xs font-semibold">{item.code}</TableCell>
                          <TableCell className="font-medium">{item.participantName}</TableCell>
                          <TableCell className="text-muted-foreground">{item.memo || "-"}</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleCopy(item)}>
                                {copiedId === item.id ? <Check className="h-4 w-4 text-primary" /> : <Clipboard className="h-4 w-4" />}
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(item)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleDelete(item.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">참여자 추가</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>참여자 이름</Label>
                <Input
                  value={form.participantName}
                  onChange={(e) => {
                    setCreateError(null);
                    setForm((prev) => ({ ...prev, participantName: e.target.value }));
                  }}
                  placeholder="홍길동"
                />
              </div>
              <div className="space-y-1.5">
                <Label>메모</Label>
                <Textarea
                  value={form.memo}
                  onChange={(e) => setForm((prev) => ({ ...prev, memo: e.target.value }))}
                  placeholder="참여자에 대한 개인 메모"
                  rows={3}
                />
              </div>
              {createError && <p className="text-sm text-destructive">{createError}</p>}
              <Button className="w-full gap-1.5" onClick={handleCreate} disabled={creating}>
                <Plus className="h-4 w-4" />
                {creating ? "추가 중..." : "추가"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">일괄 추가</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={batchText}
                onChange={(e) => {
                  setBatchError(null);
                  setBatchText(e.target.value);
                }}
                rows={6}
                placeholder={"이름,메모\n김민지,VIP\n박준호,현장 참여"}
              />
              <p className="text-xs text-muted-foreground">쉼표 또는 탭으로 이름과 메모를 구분합니다.</p>
              {batchError && <p className="text-sm text-destructive">{batchError}</p>}
              <Button
                variant="outline"
                className="w-full gap-1.5"
                onClick={handleBatchCreate}
                disabled={batchCreating}
              >
                <Plus className="h-4 w-4" />
                {batchCreating ? "추가 중..." : `${batchItems.length || 0}명 추가`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ManageLayout>
  );
};

export default ParticipantCodes;
