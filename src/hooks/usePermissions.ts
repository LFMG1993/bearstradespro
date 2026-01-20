import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const usePermissions = () => {
    const { data: permissions = [], isLoading } = useQuery({
        queryKey: ['userPermissions'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            // Consulta compleja para obtener los códigos de permisos del usuario
            // User -> UserRoles -> Roles -> RolePermissions -> Permissions
            const { data, error } = await supabase
                .from('user_roles')
                .select(`
                    roles (
                        role_permissions (
                            permissions (
                                code
                            )
                        )
                    )
                `)
                .eq('user_id', user.id);

            if (error) {
                console.error('Error fetching permissions:', error);
                return [];
            }

            // Aplanar la respuesta para tener un array simple de strings: ['signals.view', 'signals.create']
            const codes = new Set<string>();
            data?.forEach((ur: any) => {
                ur.roles?.role_permissions?.forEach((rp: any) => {
                    if (rp.permissions?.code) {
                        codes.add(rp.permissions.code);
                    }
                });
            });

            return Array.from(codes);
        },
        staleTime: 1000 * 60 * 30, // Cachear por 30 mins
    });

    const can = (permissionCode: string) => permissions.includes(permissionCode);

    return { can, isLoading, permissions };
};