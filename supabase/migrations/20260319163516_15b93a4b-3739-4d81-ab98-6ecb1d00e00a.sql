CREATE POLICY "Users can delete their own chat messages"
ON public.chat_messages
FOR DELETE
TO public
USING (auth.uid() = user_id);