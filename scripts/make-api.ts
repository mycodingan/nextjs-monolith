#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

function generateAPI() {
  const modelName = process.argv[2];
  const authType = process.argv[3]; // --public, --auth, --admin
  
  if (!modelName) {
    console.log(`
🚀 NearnNext Make API

Usage:
  npm run make:api <model_name> [auth_type]

Auth Types:
  --public    - No authentication required (default)
  --auth      - Requires user authentication
  --admin     - Requires admin authentication

Examples:
  npm run make:api post --public
  npm run make:api post --auth
  npm run make:api user --admin
  npm run make:api category

This will create:
- src/app/api/{model}s/route.ts
- src/app/api/{model}s/[id]/route.ts
    `);
    return;
  }

  const modelNamePlural = modelName.endsWith('s') ? modelName : `${modelName}s`;
  const modelNameSingular = modelName.endsWith('s') ? modelName.slice(0, -1) : modelName;
  
  // Determine authentication type
  let authImport = '';
  let authCheck = '';
  let authUser = '';
  
  if (authType === '--auth') {
    authImport = `import { requireAuth, AuthenticatedUser } from '@/lib/auth';`;
    authCheck = `
    // Check authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }
    const user = authResult;`;
    authUser = 'const user = authResult;';
  } else if (authType === '--admin') {
    authImport = `import { requireAdmin, AuthenticatedUser } from '@/lib/auth';`;
    authCheck = `
    // Check admin authentication
    const authResult = await requireAdmin(request);
    if (authResult instanceof Response) {
      return authResult;
    }
    const user = authResult;`;
    authUser = 'const user = authResult;';
  }
  
  // Create API directory
  const apiDir = path.join(process.cwd(), 'src', 'app', 'api', modelNamePlural);
  const apiIdDir = path.join(apiDir, '[id]');
  
  // Create directories
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }
  if (!fs.existsSync(apiIdDir)) {
    fs.mkdirSync(apiIdDir, { recursive: true });
  }

  // Generate main route file
  const mainRouteTemplate = `import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';${authImport}

// GET /api/${modelNamePlural} - Get all ${modelNamePlural}
export async function GET(request: NextRequest) {
  try {${authCheck}
    const ${modelNamePlural} = await query(
      'SELECT * FROM ${modelNamePlural} ORDER BY created_at DESC'
    );

    return NextResponse.json({ ${modelNamePlural} }, { status: 200 });
  } catch (error) {
    console.error('Error fetching ${modelNamePlural}:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/${modelNamePlural} - Create new ${modelNameSingular}
export async function POST(request: NextRequest) {
  try {${authCheck}
    const body = await request.json();
    const { name, description } = body; // Adjust fields as needed

    // Validasi input
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Buat ${modelNameSingular} baru (tanpa mengisi id karena AUTO_INCREMENT)
    const result = await query(
      'INSERT INTO ${modelNamePlural} (name, description) VALUES (?, ?)',
      [name, description]
    );

    // Ambil ${modelNameSingular} yang baru dibuat berdasarkan name
    const new${modelNameSingular.charAt(0).toUpperCase() + modelNameSingular.slice(1)} = await query(
      'SELECT * FROM ${modelNamePlural} WHERE name = ? ORDER BY id DESC LIMIT 1',
      [name]
    );

    return NextResponse.json({ ${modelNameSingular}: new${modelNameSingular.charAt(0).toUpperCase() + modelNameSingular.slice(1)}[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating ${modelNameSingular}:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
`;

  // Generate ID route file
  const idRouteTemplate = `import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';${authImport}

// GET /api/${modelNamePlural}/[id] - Get ${modelNameSingular} by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {${authCheck}
    const { id } = params;

    const ${modelNamePlural} = await query(
      'SELECT * FROM ${modelNamePlural} WHERE id = ?',
      [id]
    );

    if (${modelNamePlural}.length === 0) {
      return NextResponse.json(
        { error: '${modelNameSingular.charAt(0).toUpperCase() + modelNameSingular.slice(1)} not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ${modelNameSingular}: ${modelNamePlural}[0] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching ${modelNameSingular}:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/${modelNamePlural}/[id] - Update ${modelNameSingular}
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {${authCheck}
    const { id } = params;
    const body = await request.json();
    const { name, description } = body; // Adjust fields as needed

    // Cek apakah ${modelNameSingular} exists
    const existing${modelNameSingular.charAt(0).toUpperCase() + modelNameSingular.slice(1)} = await query(
      'SELECT id FROM ${modelNamePlural} WHERE id = ?',
      [id]
    );

    if (existing${modelNameSingular.charAt(0).toUpperCase() + modelNameSingular.slice(1)}.length === 0) {
      return NextResponse.json(
        { error: '${modelNameSingular.charAt(0).toUpperCase() + modelNameSingular.slice(1)} not found' },
        { status: 404 }
      );
    }

    // Update ${modelNameSingular}
    await query(
      'UPDATE ${modelNamePlural} SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, id]
    );

    // Ambil ${modelNameSingular} yang diupdate
    const updated${modelNameSingular.charAt(0).toUpperCase() + modelNameSingular.slice(1)} = await query(
      'SELECT * FROM ${modelNamePlural} WHERE id = ?',
      [id]
    );

    return NextResponse.json({ ${modelNameSingular}: updated${modelNameSingular.charAt(0).toUpperCase() + modelNameSingular.slice(1)}[0] }, { status: 200 });
  } catch (error) {
    console.error('Error updating ${modelNameSingular}:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/${modelNamePlural}/[id] - Delete ${modelNameSingular}
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {${authCheck}
    const { id } = params;

    // Cek apakah ${modelNameSingular} exists
    const existing${modelNameSingular.charAt(0).toUpperCase() + modelNameSingular.slice(1)} = await query(
      'SELECT id FROM ${modelNamePlural} WHERE id = ?',
      [id]
    );

    if (existing${modelNameSingular.charAt(0).toUpperCase() + modelNameSingular.slice(1)}.length === 0) {
      return NextResponse.json(
        { error: '${modelNameSingular.charAt(0).toUpperCase() + modelNameSingular.slice(1)} not found' },
        { status: 404 }
      );
    }

    // Delete ${modelNameSingular}
    await query('DELETE FROM ${modelNamePlural} WHERE id = ?', [id]);

    return NextResponse.json(
      { message: '${modelNameSingular.charAt(0).toUpperCase() + modelNameSingular.slice(1)} deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting ${modelNameSingular}:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
`;

  try {
    // Write main route file
    fs.writeFileSync(path.join(apiDir, 'route.ts'), mainRouteTemplate);
    
    // Write ID route file
    fs.writeFileSync(path.join(apiIdDir, 'route.ts'), idRouteTemplate);
    
    const authInfo = authType ? ` (${authType})` : ' (public)';
    console.log(`✅ API routes created for ${modelNameSingular}${authInfo}:`);
    console.log(`📁 GET/POST: src/app/api/${modelNamePlural}/route.ts`);
    console.log(`📁 GET/PUT/DELETE: src/app/api/${modelNamePlural}/[id]/route.ts`);
    console.log(`\n📝 Next steps:`);
    console.log(`1. Create migration: npm run make:migration create_${modelNamePlural}_table`);
    console.log(`2. Edit the API routes as needed`);
    console.log(`3. Run migration: npm run migrate:migrate`);
    
    if (authType === '--auth' || authType === '--admin') {
      console.log(`\n🔐 Authentication required:`);
      console.log(`- Include Authorization header: Bearer <token>`);
      console.log(`- Token obtained from /api/auth/login`);
    }
    
  } catch (error) {
    console.error('❌ Error creating API routes:', error);
  }
}

generateAPI(); 