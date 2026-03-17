import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";
import type { ContentItem } from "@/data/adminMockData";
import { contentTypeLabel, contentStatusLabel } from "@/data/adminMockData";

interface Props {
  item: ContentItem;
}

const typeColorMap: Record<string, string> = {
  draw: "bg-primary/15 text-primary",
  quiz: "bg-secondary/20 text-secondary-foreground",
  messagebox: "bg-accent/20 text-accent-foreground",
};

const ContentCard: React.FC<Props> = ({ item }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="flex items-center justify-between gap-4 p-4">
      <div className="flex-1 min-w-0 space-y-1">
        <h3 className="font-semibold text-foreground truncate">{item.title}</h3>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline" className={typeColorMap[item.type] ?? ""}>
            {contentTypeLabel[item.type]}
          </Badge>
          <Badge variant={item.status === "active" ? "default" : "secondary"}>
            {contentStatusLabel[item.status]}
          </Badge>
          <span className="text-muted-foreground">{item.createdAt}</span>
        </div>
      </div>

      <Link to={`/admin/manage/${item.id}`}>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Settings className="h-3.5 w-3.5" />
          관리
        </Button>
      </Link>
    </CardContent>
  </Card>
);

export default ContentCard;
