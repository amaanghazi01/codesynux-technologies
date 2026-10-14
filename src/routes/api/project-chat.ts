import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/api/project-chat')({ server: { handlers: { POST: async ({ request }) => {
  const { projectChatRequest } = await import('@/lib/ai/chat.server');
  return projectChatRequest(request);
} } } });
