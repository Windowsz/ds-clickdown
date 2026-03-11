'use client';

import { useEffect } from 'react';
import { useWorkspaceStore } from '@/store/workspace-store';
import SpacePage from '@/components/features/space/SpacePage';

export default function Page({ params }: { params: { spaceId: string; listId: string } }) {
  const { setActiveSpace, setActiveList } = useWorkspaceStore();

  useEffect(() => {
    setActiveSpace(params.spaceId);
    setActiveList(params.listId);
  }, [params.spaceId, params.listId]);

  return <SpacePage />;
}
