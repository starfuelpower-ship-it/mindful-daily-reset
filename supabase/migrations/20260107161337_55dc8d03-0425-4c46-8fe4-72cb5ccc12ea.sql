-- Performance indexes for core habit queries
-- These speed up the most frequent operations without changing functionality

-- Index for fetching user's habits (most common query)
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);

-- Index for fetching habit completions by user and date
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_id ON public.habit_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_completed_at ON public.habit_completions(completed_at);
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_date ON public.habit_completions(user_id, completed_at);

-- Index for point transactions history
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON public.point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON public.point_transactions(created_at DESC);

-- Index for group activities (for feed queries)
CREATE INDEX IF NOT EXISTS idx_group_activities_group_id ON public.group_activities(group_id);
CREATE INDEX IF NOT EXISTS idx_group_activities_created_at ON public.group_activities(created_at DESC);

-- Index for group chat (sorted messages)
CREATE INDEX IF NOT EXISTS idx_group_chat_group_id ON public.group_chat(group_id);
CREATE INDEX IF NOT EXISTS idx_group_chat_created_at ON public.group_chat(created_at DESC);

-- Index for moods by date (for trends)
CREATE INDEX IF NOT EXISTS idx_moods_user_date ON public.moods(user_id, date DESC);