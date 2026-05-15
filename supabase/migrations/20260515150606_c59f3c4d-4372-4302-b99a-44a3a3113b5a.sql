revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
revoke execute on function public.current_vendor_id() from public, anon;
revoke execute on function public.can_access_vendor(uuid, uuid) from public, anon;
revoke execute on function public.update_updated_at_column() from public, anon;

grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.current_vendor_id() to authenticated;
grant execute on function public.can_access_vendor(uuid, uuid) to authenticated;
grant execute on function public.update_updated_at_column() to authenticated;
