-- Add streak freeze feature to user_points table
ALTER TABLE public.user_points 
ADD COLUMN IF NOT EXISTS streak_freezes_available INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_freeze_refill DATE;

-- Function to use a streak freeze
CREATE OR REPLACE FUNCTION public.use_streak_freeze()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
  _freezes_available integer;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get current freezes
  SELECT streak_freezes_available INTO _freezes_available
  FROM user_points WHERE user_id = _user_id;
  
  IF _freezes_available IS NULL OR _freezes_available < 1 THEN
    RETURN json_build_object('success', false, 'error', 'No streak freezes available');
  END IF;
  
  -- Use the freeze
  UPDATE user_points 
  SET streak_freezes_available = streak_freezes_available - 1
  WHERE user_id = _user_id;
  
  RETURN json_build_object('success', true, 'freezes_remaining', _freezes_available - 1);
END;
$$;

-- Function to refill streak freeze (weekly)
CREATE OR REPLACE FUNCTION public.check_streak_freeze_refill()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
  _last_refill date;
  _today date;
  _week_start date;
BEGIN
  _user_id := auth.uid();
  _today := CURRENT_DATE;
  _week_start := date_trunc('week', _today)::date;
  
  IF _user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT last_freeze_refill INTO _last_refill
  FROM user_points WHERE user_id = _user_id;
  
  -- If never refilled or last refill was before this week, refill
  IF _last_refill IS NULL OR _last_refill < _week_start THEN
    UPDATE user_points 
    SET streak_freezes_available = 1, last_freeze_refill = _today
    WHERE user_id = _user_id;
    
    RETURN json_build_object('success', true, 'refilled', true, 'freezes_available', 1);
  END IF;
  
  RETURN json_build_object('success', true, 'refilled', false);
END;
$$;