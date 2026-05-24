import React, { useState, useEffect } from "react";
import ManageLayout from "@/components/manage/ManageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { User, Calendar, Trash2, Loader2 } from "lucide-react";
import { getCurrentUser, updateCurrentUser, withdrawUser } from "@/api/client";
import { UserInfo } from "@/api/types";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

const ManageSettings: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const userData = await getCurrentUser();
      setUser(userData);
      setName(userData.name);
      setOriginalName(userData.name);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      toast.error("계정 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 날짜 포맷 변환 (YYYY.MM.DD)
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // 이름 변경 여부 확인
  const hasNameChanged = name !== originalName;

  // 이름 변경 처리
  const handleUpdateName = async () => {
    if (!name.trim()) {
      toast.error("이름을 입력해주세요.");
      return;
    }
    
    try {
      setIsUpdating(true);
      const updatedUser = await updateCurrentUser({ name: name.trim() });
      setUser(updatedUser);
      setOriginalName(updatedUser.name);
      setName(updatedUser.name);
      toast.success("이름이 변경되었습니다.");
    } catch (error) {
      console.error("Failed to update name:", error);
      toast.error("이름 변경에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 수정 취소 처리
  const handleCancelEdit = () => {
    setName(originalName);
  };

  // 계정 삭제 처리 (탈퇴)
  const handleDeleteAccount = async () => {
    try {
      setIsUpdating(true);
      await withdrawUser();
      await supabase.auth.signOut();
      toast.success("탈퇴 처리가 완료되었습니다.");
      navigate("/");
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("탈퇴 처리 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <ManageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ManageLayout>
    );
  }

  return (
    <ManageLayout>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[480px] mx-auto">
          {/* 페이지 헤더 */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">계정 설정</h1>
            <p className="mt-2 text-sm text-gray-500">
              계정 정보를 관리하고 설정을 변경할 수 있습니다.
            </p>
          </div>

          {/* 계정 정보 카드 */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                계정 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 이름 수정 */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  이름
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름을 입력하세요"
                    className="flex-1"
                    disabled={isUpdating}
                  />
                  <Button
                    onClick={handleUpdateName}
                    disabled={!hasNameChanged || isUpdating}
                    className="whitespace-nowrap"
                  >
                    {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    변경
                  </Button>
                </div>
                {hasNameChanged && !isUpdating && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="text-gray-500 h-auto py-1"
                  >
                    취소
                  </Button>
                )}
              </div>

              {/* 구분선 */}
              <div className="border-t border-gray-200" />

              {/* 계정 생성일 */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  계정 생성일
                </Label>
                <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-700 text-sm">
                  {formatDate(user?.createdAt)}
                </div>
                <p className="text-xs text-gray-400">
                  계정 생성일은 변경할 수 없습니다.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 위험 구역 (Danger Zone) */}
          <Card className="mt-6 shadow-sm border-red-200">
            <CardHeader>
              <CardTitle className="text-lg text-red-600 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                위험 영역
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">회원 탈퇴</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    계정을 삭제하면 모든 데이터가 영구적으로 제거됩니다. 이 작업은 되돌릴 수 없습니다.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  탈퇴하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 탈퇴 확인 모달 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">탈퇴하기</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 탈퇴하시겠습니까? 이 작업은 취소할 수 없으며 모든 데이터가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              탈퇴
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ManageLayout>
  );
};

export default ManageSettings;