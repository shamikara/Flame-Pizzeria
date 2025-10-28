import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    console.log('Fetching session...');
    const session = await getServerSession();
    
    // Log the complete session object to inspect its structure
    console.log('Complete session object:', JSON.stringify(session, null, 2));
    
    if (!session) {
      console.error('No session found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Check both 'roles' and 'role' for backward compatibility
    const userRoles = session.roles || [];
    const userRole = (session as any).role; // Check for singular 'role' as well
    
    if (userRole) {
      userRoles.push(userRole);
    }
    
    console.log('User roles/role:', { roles: userRoles, role: userRole });
    
    if (!userRoles.includes('ADMIN') && userRole !== 'ADMIN') {
      console.error('User is not an admin. Roles/role:', { roles: userRoles, role: userRole });
      return NextResponse.json(
        { 
          error: 'Insufficient permissions',
          debug: {
            hasRoles: !!session.roles,
            hasRole: !!(session as any).role,
            roles: session.roles,
            role: (session as any).role
          }
        },
        { status: 403 }
      );
    }

    console.log('Fetching reviews from database...');
    const reviews = await prisma.rating.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        foodItem: {
          select: {
            id: true,
            name: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        {
          stars: 'desc', // Sort by highest rating first
        },
        {
          createdAt: 'desc', // Then by newest first
        },
      ],
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending reviews' },
      { status: 500 }
    );
  }
}
