import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";
import type { ManageContentResponse } from "@/api/types";
import { getContentTypeLabel, getContentTypeColor } from "@/lib/contentTypeConstants";

interface Props {
  item: ManageContentResponse;
}

const ContentCard: React.FC<Props> = ({ item }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="flex items-center justify-between gap-4 p-4">
      <div className="flex-1 min-w-0 space-y-1">
        <h3 className="font-semibold text-foreground truncate">{item.title}</h3>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline" className={getContentTypeColor(item.type)}>
            {getContentTypeLabel(item.type)}
          </Badge>
          <span className="text-muted-foreground font-mono text-[11px]">{item.code}</span>
          <span className="text-muted-foreground">
            {new Date(item.createdAt).toLocaleDateString("ko-KR")}
          </span>
        </div>
      </div>

      <Link to={`/manage/${item.code}`}>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Settings className="h-3.5 w-3.5" />
          관리
        </Button>
      </Link>
    </CardContent>
  </Card>
);

export default ContentCard;
