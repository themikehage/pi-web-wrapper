import { WorkspacePanel } from "@/components/workspace/WorkspacePanel";

interface Props {
  onClose: () => void;
}

export function WorkspacePage({ onClose }: Props) {
  return (
    <div className="h-dvh flex flex-col bg-bg">
      <WorkspacePanel onClose={onClose} />
    </div>
  );
}
