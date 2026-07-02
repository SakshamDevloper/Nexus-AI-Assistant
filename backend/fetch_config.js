import admin from 'firebase-admin';
import { getProjectManagement } from 'firebase-admin/project-management';

const serviceAccount = {
  "type": "service_account",
  "project_id": "nexus-ai-b4b62",
  "private_key_id": "1209d3889fd194500ce4971ac4d9f759cd4b67d6",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDIliDUrIGKKoK5\nnR0WatcOSJUntS9cgZEtEENhEX9nn3v2H2ITdp3A+pNCX842fhS1hJWVmVedB4w/\ntSre/7r3jT79kcSCnERCC21alnkPbnOQidjcyRx/4+D3ZIqFziWIaW/FTmYEw4AO\nALaEbGIbMg4BR7O8Nl0WaH4La8PR84XatJHmFFzrnBRh+9HzQ44xyVbOIvEb5kq6\nOwB/e+i8G0LXqmNGW1tln09DJk27BLz1bb/niLJJHYtwPMLE6t/pJT+CfuNNjfUa\n9sOgtvDHT42Mo7yM0trSSDvehJCMQnfjmeBYpZNjK+PvaYAs4qURy/c0HnvlA0zX\ndLvuNMy5AgMBAAECggEABcJ4fIgxi1/vc1ilalc0sqZ3O0soFNNsRut7ISaT+SFA\nDtAANx0w/XFp2L47LnRjWteiRfKVF0oNXGedgga80yPn+vb8ZLW2U2EpntrIQh8C\noX6xI/HVvX8JHtbGZX4xtLThA+eIOrsfCl054HE48J1OKqTo7nlvJdgSmnhZ3fA/\nnPQ0yODgtqeSCzcE7DL2eKP+CaV+8s3uROyfZDpsQ7uXWzRm+Y1xDmmlSFo6ndh/\n90uj1TlshaLZ/pbiY7juKJ70VmWtangfUm3aVkelxDyVvO89XgrdbYCywwSc4BgU\nFq5671HSojQTvxOweGu9WNOMMlCPzN5f71Yg4hUgAwKBgQD3TWHbZe+hZMhx8+0U\nRCoHBJySFWC1uDWMA39Rb7/31u5Aim+ZPexDe5sizM2Qc2XwmHDj/F8YVwXiks4V\n2hv3EBB0u12XzPP7NHQeiBRFqSm58qiFtUqlwrMdVO7mLMXs7yLs45aWNfAVMKuE\nT+si4uoraAyUGZDNftL2kHNV+wKBgQDPpCJL4YY2rn0FBLAbrcze0ODboApo4DQx\nTMB+LR7ulYXUU3mRmy87Tb/snZeGYOKAqdtxwn9oVEK+OxxUi9sZ4e5SYdNNheEJ\n8iPzAUjPLvf2cncmEifCvUM76jA3+4zu4m4pJrvgWxhPAe5FTvXcwKNOb0HX0dzQ\nmZTLe12N2wKBgGEbS5+hCVVwg5zrUV6x3WbgErLyHgV9DdmqzeWmYdTp2qgRM/0S\naaGd+a7SiK1+ArtUwI9lW9ns4ey0BKRj/rMm5a9Qm1GuMuejEy2h9YPdBvtzI2VN\naMBqEXclEKHlVtrQlAA85baZ+2n2sILF9ui9/YGJ29aTq15lvGUBF6jdAoGBAImI\nbRMXyT9U6gg157QdtZJshlPSuLJotwlkjifFGTTsox1VQTO5t1ovkI1YgPIIIF8a\novjB3IQtM5wvKP+zNyf4p1O36i7yG3HsCfW+hwx8Ts/VV6hG5EEv/WWlI9Ug8GOW\nZWMqfc0IaZyDaeBMgbt7eW/Nb65VGk6tO4pgJ0J7AoGALsu/k+Uf3fuFsUDq/su6\nzJZBbAwbZDGiI2lUiq+YdMS4dD9AuwFf+kJ+KtIj7Y5O2JeMtcGbB3fI3hIV1AVA\nGqPBFp9WhuQdp8huB2QfJb9gLG+cFzXk702Jy97mEEucW09TiIiHCE9b+aoEPC2b\n/8iObzJcVdGZdiW3Livmu8A=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@nexus-ai-b4b62.iam.gserviceaccount.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function main() {
  try {
    const projectManagement = getProjectManagement();
    const webApps = await projectManagement.listWebApps();
    console.log(`Found ${webApps.length} web apps.`);
    for (const app of webApps) {
      const config = await app.getConfig();
      console.log('--- APP CONFIG ---');
      console.log(JSON.stringify(config, null, 2));
    }
  } catch (error) {
    console.error('Error fetching config:', error);
  }
}

main();
