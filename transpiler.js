
const DEBUG = false;
const VANILLA_SCHEMA_VALIDATOR_MODULES           = Symbol.for( 'vanilla-schema-validator.modules' );
const VANILLA_SCHEMA_VALIDATOR_DIRECTIVE_0 = [ 'VANILLA_SCHEMA_VALIDATOR', 'ENABLE', 'TRANSPILE' ];

const compare_arrays = (a1, a2) =>
  a1.length == a2.length &&
  a1.every( (element, index) => element === a2[index] );



async function* getFiles( dir ) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  for ( const dirent of dirents ) {
    const filename = path.join( dir, dirent.name );
    if ( dirent.isDirectory() ) {
      yield* getFiles( filename );
    } else {
      yield filename;
    }
  }
}


async function build(nargs) {
  if ( DEBUG ) {
    console.log(nargs);
  }
  const {
    inputDir,
    outputDir,
    extensions,
  }= nargs;

  const async_results = [];
  const request_paths = [];

  console.log( 'building ... ', inputDir );
  for await ( const rel_path of getFiles( inputDir ) ) {
    if ( extensions.some( e=>rel_path.endsWith( e ) ) ) {
      console.log( 'examiniing:', rel_path );
      const f = (await fs.readFile( rel_path )).toString();
      const r = rip_directives( rip_comments( f ) ).map( s=>s.split( /\s+/ ).map(e=>e.trim() ) );

      // HERE
      if ( r.some( directive_arr=>compare_arrays( directive_arr,  VANILLA_SCHEMA_VALIDATOR_DIRECTIVE_0 ) ) ) {
        const abs_path = path.resolve( process.cwd(), rel_path );
        console.log( 'importing ', abs_path );
        request_paths.push( abs_path );
        async_results.push( import( abs_path  ) );
      } else {
        // console.log( rel_path, 'ignored2', r );
      }
    } else {
      // console.log( rel_path, 'ignored' );
    }
  };

  await Promise.all( async_results );

  const modules = schema[VANILLA_SCHEMA_VALIDATOR_MODULES];


  if ( DEBUG ) {
    console.error( 'modules', modules );
    console.error( 'all', modules
      .map(e=>e.filename) );
    console.error( 'filtered', modules
      .filter(e=>request_paths.some( ee=>ee===e.filename ))
      .map(e=>e.filename)
    );
    console.error( 'request_paths',
      request_paths );
  }

  const compiled_modules = modules
    .filter( module=>request_paths.some( ee=>ee===module.filename ))
    .map(module=>({
      ...module,
      output_filename : path.join( outputDir, path.relative( inputDir, module.output_filename ?? module.filename ) ),
      output_string   : module.transpile() // HERE
    }));

  if ( DEBUG ) {
    console.error( 'compiled', compiled_modules   );
  }

  for ( const module of compiled_modules ) {
    const output_file = module.output_filename;
    const output_string = module.output_string;
    fs.mkdir( path.dirname( output_file ), {recursive:true} );
    fs.writeFile( output_file, output_string );
    console.log( 'writing to', output_file );
  }

}


async function build_doc() {
}


