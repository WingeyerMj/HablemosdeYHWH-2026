const adminController = require('./src/controllers/adminController');

const textToTest = `16
Le despertaron a celos con los dioses ajenos;
Lo provocaron a ira con abominaciones.
17
Sacrificaron a los demonios, y no a Dios;
A dioses que no habían conocido,
A nuevos dioses venidos de cerca,
Que no habían temido vuestros padres.
18
De la Roca que te creó te olvidaste;
Te has olvidado de Dios tu creador.`;

const req1 = {
    body: {
        text: textToTest,
        ref: 'Deuteronomio 32:16-18'
    }
};

const res1 = {
    json: (data) => {
        console.log('1. API Response with REF:', data.success ? 'SUCCESS' : 'FAILED');
        console.log('Hebrew preview:', data.hebrew ? data.hebrew.slice(0, 80) : 'none');
        console.log('Phonetic preview:', data.phonetic ? data.phonetic.slice(0, 80) : 'none');
    },
    status: (code) => ({ json: (d) => console.log('Status ' + code, d) })
};

async function test() {
    await adminController.apiTranslateSpanishToHebrew(req1, res1);

    const req2 = {
        body: {
            text: textToTest,
            ref: ''
        }
    };
    const res2 = {
        json: (data) => {
            console.log('\n2. API Response WITHOUT REF (Direct text translate):', data.success ? 'SUCCESS' : 'FAILED');
            console.log('Hebrew preview:', data.hebrew ? data.hebrew.slice(0, 80) : 'none');
            console.log('Phonetic preview:', data.phonetic ? data.phonetic.slice(0, 80) : 'none');
            process.exit(0);
        },
        status: (code) => ({ json: (d) => { console.log('Status ' + code, d); process.exit(1); } })
    };
    await adminController.apiTranslateSpanishToHebrew(req2, res2);
}

test();
