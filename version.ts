import { defaultReactVersion } from './shared/constants.ts'

/** `VERSION` managed by https://deno.land/x/publish */
export const VERSION = '0.3.0-beta.2'

/** `prepublish` will be invoked before publish */
export async function prepublish(version: string): Promise<boolean> {
  const p = Deno.run({
    cmd: ['deno', 'run', '-A', 'build.ts'],
    cwd: './compiler',
    stdout: 'inherit',
    stderr: 'inherit',
  })
  const { success } = await p.status()
  p.close()
  if (success) {
    const data = await Deno.readTextFile('./import_map.json')
    const importMap = JSON.parse(data)
    Object.assign(importMap.imports, {
      'aleph/': `https://deno.land/x/aleph@v${version}/`,
      'aleph/types': `https://deno.land/x/aleph@v${version}/types.d.ts`,
      'aleph/web': `https://deno.land/x/aleph@v${version}/framework/core/mod.ts`,
      'aleph/react': `https://deno.land/x/aleph@v${version}/framework/react/mod.ts`,
      'react': `https://esm.sh/react@${defaultReactVersion}`,
      'react-dom': `https://esm.sh/react-dom@${defaultReactVersion}`,
    })
    await Deno.writeTextFile(
      './import_map.json',
      JSON.stringify(importMap, undefined, 2)
    )
  }
  return success
}
