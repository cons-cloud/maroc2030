-- Create a function to safely get user emails
CREATE OR REPLACE FUNCTION public.get_user_emails()
RETURNS TABLE (
  id uuid,
  email text
)
SECURITY DEFINER
LANGUAGE sql
AS $$
  SELECT id, email::text 
  FROM auth.users
  WHERE auth.uid() IS NOT NULL; -- Only allow authenticated users
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_emails() TO authenticated;

-- Create a policy to allow users to see their own email
CREATE POLICY "Users can view their own email" 
ON auth.users 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);
