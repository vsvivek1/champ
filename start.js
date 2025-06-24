(async () => {
  const { execa } = await import('execa');

  try {

    let d=new Date();
    let h=d.getHours();
    let m=d.getMinutes()

// console.log(h)
//     if(h<9 || h>16){

//         console.log('no time');

//         return 'no time'


//     }

    console.log('Running newFetch.js...');
    await execa('node', ['./newFetch.js'], { stdio: 'inherit' });

    console.log('newFetch.js completed. Starting other scripts in parallel...');
    await Promise.all([
      execa('node', ['champ/startInstruments.js'], { stdio: 'inherit' }),
      execa('node', ['./server.js'], { stdio: 'inherit' })
    ]);
  } catch (error) {
    console.error('Error:', error);
  }
})();
