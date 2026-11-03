/**
 * Sanity seed — Všeobecné obchodní podmínky (CS + EN)
 * Použití:
 *   node scripts/seed-legal.mjs           → přepíše publikovanou verzi (hned živě)
 *   node scripts/seed-legal.mjs --draft   → uloží jako draft, publikuje se ručně ve Studiu
 * Vyžaduje SANITY_WRITE_TOKEN v .env
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const env = {}
try {
  readFileSync(resolve(__dir, '../.env'), 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k?.trim()) env[k.trim()] = v.join('=').trim()
  })
} catch {}

const client = createClient({
  projectId: env.PUBLIC_SANITY_PROJECT_ID ?? 'wgpoci6t',
  dataset:   env.PUBLIC_SANITY_DATASET   ?? 'production',
  apiVersion: '2024-01-01',
  token: env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

const key = () => Math.random().toString(36).slice(2)

const block = (text, extra = {}) => ({
  _type: 'block', _key: key(),
  style: 'normal', markDefs: [],
  children: [{ _type: 'span', _key: 'a', text, marks: [] }],
  ...extra,
})

const h2 = (text) => block(text, { style: 'h2' })
const li = (text) => block(text, { listItem: 'bullet', level: 1 })

const doc = {
  _type: 'legalPage',
  _id:   process.argv.includes('--draft') ? 'drafts.legalPage-vop' : 'legalPage-vop',
  title: 'Všeobecné obchodní podmínky',
  titleEn: 'Terms and Conditions',
  slug:  { _type: 'slug', current: 'vseobecne-obchodni-podminky' },
  body: [
    h2('1. Úvodní ustanovení'),
    block('1.1 Tyto všeobecné obchodní podmínky (dále jen „VOP“) upravují v souladu s § 1751 a násl. zákona č. 89/2012 Sb., občanský zákoník (dále jen „občanský zákoník“), práva a povinnosti mezi společností Slant, s.r.o., IČO 092 50 239, DIČ CZ09250239, se sídlem Zborovská 940/2a, Žabovřesky, 616 00 Brno, zapsanou v obchodním rejstříku vedeném Krajským soudem v Brně, oddíl C, vložka 118048 (dále jen „Poskytovatel“), a jejími klienty (dále jen „Klient“).'),
    block('1.2 VOP se vztahují na veškeré služby Poskytovatele, zejména na tvorbu značky a brandingovou strategii, tvorbu názvů (naming), vizuální identitu, grafický, UX/UI a digitální design a související kreativní a konzultační služby (dále jen „Služby“), a na výsledky Služeb (dále jen „Dílo“).'),
    block('1.3 VOP jsou určeny především pro Klienty, kteří jsou podnikateli nebo právnickými osobami a uzavírají smlouvu v rámci své podnikatelské činnosti. Je-li Klient spotřebitelem, použijí se VOP jen v rozsahu, v jakém nejsou v rozporu s ustanoveními právních předpisů na ochranu spotřebitele. Práva, která spotřebiteli náleží ze zákona, zůstávají nedotčena.'),
    block('1.4 Ujednání v individuální smlouvě, nabídce nebo objednávce mají přednost před ustanoveními těchto VOP.'),

    h2('2. Uzavření smlouvy a souhlas s VOP'),
    block('2.1 Smlouva mezi Poskytovatelem a Klientem vzniká tím, že Klient písemně (i e-mailem) potvrdí nabídku Poskytovatele, podepíše smlouvu, uhradí zálohovou fakturu, nebo zadá Poskytovateli práci a Poskytovatel s jejím plněním začne.'),
    block('2.2 Navázáním spolupráce kterýmkoli ze způsobů uvedených v čl. 2.1 Klient potvrzuje, že se s těmito VOP seznámil a souhlasí s nimi. Souhlas zahrnuje i souhlas s prezentací Díla a uvedením Klienta jako reference podle čl. 8. VOP jsou nedílnou součástí každé smlouvy mezi Poskytovatelem a Klientem. Poskytovatel na ně odkazuje ve své nabídce a jsou trvale dostupné na webu www.slant.cz.'),
    block('2.3 Rozsah Služeb, cena, harmonogram a počet korekčních kol se sjednávají v nabídce nebo smlouvě (dále jen „Zadání“). Práce nad rámec Zadání provede Poskytovatel po odsouhlasení Klientem a účtuje je zvlášť.'),

    h2('3. Průběh spolupráce a součinnost Klienta'),
    block('3.1 Klient poskytne Poskytovateli včas a v úplnosti podklady, informace, zpětnou vazbu a přístupy potřebné k plnění. Klient odpovídá za to, že jím dodané podklady (zejména texty, fotografie, loga a data) neporušují práva třetích osob.'),
    block('3.2 Je-li Klient v prodlení se součinností, termíny plnění se prodlužují o dobu tohoto prodlení. Trvá-li prodlení déle než 30 dní, je Poskytovatel oprávněn práce pozastavit a vyúčtovat dosud provedenou práci.'),
    block('3.3 Cena zahrnuje počet korekčních kol uvedený v Zadání. Není-li v Zadání uveden, zahrnuje cena dvě kola korekcí. Další korekce a změny Zadání se účtují podle aktuální hodinové sazby Poskytovatele.'),
    block('3.4 Poskytovatel je oprávněn plnit prostřednictvím spolupracujících dodavatelů. Za jejich plnění odpovídá, jako by plnil sám.'),

    h2('4. Předání a převzetí Díla'),
    block('4.1 Dílo nebo jeho etapa se předává zpravidla elektronicky. Klient je povinen Dílo bez zbytečného odkladu zkontrolovat a případné vady nebo připomínky sdělit Poskytovateli do 10 pracovních dnů od předání. Neučiní-li tak, nebo začne-li Dílo užívat, má se za to, že Dílo převzal bez výhrad.'),
    block('4.2 Podoba Díla vychází z odborného a uměleckého úsudku Poskytovatele. Pouhý nesouhlas Klienta s estetickým pojetím Díla, které odpovídá Zadání, není vadou Díla.'),
    block('4.3 Zdrojové a pracovní soubory (např. otevřené soubory grafických aplikací) nejsou součástí plnění, není-li v Zadání ujednáno jinak.'),

    h2('5. Cena a platební podmínky'),
    block('5.1 Ceny jsou uváděny bez DPH. K ceně se připočítává DPH v zákonné výši.'),
    block('5.2 Poskytovatel je oprávněn požadovat před zahájením prací zálohu, zpravidla ve výši 50 % ceny. Zbývající část ceny se fakturuje po předání Díla. U dlouhodobých projektů se fakturuje průběžně podle etap nebo měsíčně.'),
    block('5.3 Faktury jsou splatné do 14 dnů od jejich vystavení, není-li sjednáno jinak. Při prodlení Klienta s platbou je Poskytovatel oprávněn požadovat úrok z prodlení v zákonné výši a pozastavit práce až do úplného zaplacení.'),
    block('5.4 Ukončí-li Klient spolupráci před dokončením Díla z důvodu, který není na straně Poskytovatele, uhradí cenu dosud provedené práce a účelně vynaložené náklady. Uhrazená záloha se na tuto částku započítává.'),

    h2('6. Autorská práva a licence'),
    block('6.1 Dílo může být autorským dílem ve smyslu zákona č. 121/2000 Sb., autorský zákon. Majetková autorská práva k Dílu vykonává Poskytovatel.'),
    block('6.2 Úplným zaplacením ceny získává Klient k finální odsouhlasené verzi Díla výhradní licenci ke všem způsobům užití, bez územního, časového a množstevního omezení. Licence zahrnuje i právo Dílo upravovat, zpracovávat, spojovat s jinými díly, poskytnout podlicenci a licenci postoupit třetí osobě. Odměna za licenci je zahrnuta v ceně. Klient není povinen licenci využít.'),
    block('6.3 Do úplného zaplacení ceny není Klient oprávněn Dílo užívat, nedohodnou-li se strany jinak.'),
    block('6.4 Nevybrané návrhy, alternativy, skici a koncepty zůstávají Poskytovateli. Klient k nim licenci nezískává.'),
    block('6.5 Poskytovatel je oprávněn i nadále užívat obecné know-how, postupy a nástroje, které při plnění použil nebo vytvořil.'),
    block('6.6 Prvky třetích stran, zejména písma, fotografie z fotobank, ikony a software, nejsou součástí licence podle čl. 6.2. Řídí se licenčními podmínkami svých poskytovatelů a licenci k nim si Klient pořizuje na vlastní náklady, není-li sjednáno jinak.'),
    block('6.7 Osobnostní práva autorů nejsou dotčena.'),

    h2('7. Názvy a ochranné známky'),
    block('7.1 Není-li výslovně sjednána rešerše, Poskytovatel nezaručuje, že navržený název, logo nebo jiné označení lze zapsat jako ochrannou známku nebo doménu, ani že neporušuje práva třetích osob. Poskytovatel Klientovi doporučuje před užitím označení provést rešerši a podat přihlášku ochranné známky. Za tyto kroky odpovídá Klient.'),

    h2('8. Portfolio a reference'),
    block('8.1 Klient uděluje Poskytovateli bezúplatný, nevýhradní, územně a časově neomezený souhlas a licenci k tomu, aby Poskytovatel:'),
    li('prezentoval Dílo a další výstupy spolupráce, včetně procesních materiálů a vizualizací, ve svém portfoliu, na webových stránkách, sociálních sítích, v prezentacích, nabídkách, tiskovinách, publikacích a v oborových soutěžích;'),
    li('uváděl obchodní firmu, název, logo a ochranné známky Klienta jako referenci, včetně stručného popisu spolupráce;'),
    li('uváděl své autorství Díla.'),
    block('8.2 Poskytovatel přitom nezveřejní důvěrné informace Klienta. Dílo, které Klient dosud nezveřejnil, prezentuje až po jeho oficiálním uvedení nebo po uplynutí přiměřené doby.'),
    block('8.3 Požaduje-li Klient, aby spolupráce zůstala neveřejná, nebo aby byla prezentace odložena, je třeba to písemně sjednat před uzavřením smlouvy. Takový požadavek může mít vliv na cenu. Pozdější žádost o omezení prezentace posoudí Poskytovatel individuálně.'),

    h2('9. Mlčenlivost'),
    block('9.1 Obě strany zachovávají mlčenlivost o důvěrných informacích druhé strany, které se dozvěděly v souvislosti se spoluprací, a to i po jejím skončení. Povinnost se nevztahuje na informace veřejně dostupné a na případy, kdy zveřejnění ukládá zákon. Ustanovení čl. 8 tím nejsou dotčena.'),

    h2('10. Odpovědnost'),
    block('10.1 Za obsahovou správnost textů, údajů a podkladů dodaných Klientem a za konečné schválení Díla, včetně kontroly tiskových dat před výrobou, odpovídá Klient.'),
    block('10.2 Celková náhrada škody, kterou může Klient po Poskytovateli požadovat, je omezena výší ceny Díla, v souvislosti s nímž škoda vznikla. Omezení se nevztahuje na škodu způsobenou úmyslně nebo z hrubé nedbalosti, na újmu na přirozených právech člověka ani na jiné případy, kdy omezení nepřipouští zákon.'),
    block('10.3 Poskytovatel neodpovídá za ušlý zisk ani za škodu vzniklou nesprávným užitím Díla Klientem nebo třetí osobou.'),

    h2('11. Ochrana osobních údajů'),
    block('11.1 Poskytovatel zpracovává osobní údaje Klienta a jeho kontaktních osob jako správce v souladu s nařízením (EU) 2016/679 (GDPR) a zákonem č. 110/2019 Sb., o zpracování osobních údajů. Zpracovává je za účelem uzavření a plnění smlouvy, plnění právních povinností a na základě oprávněného zájmu, zejména pro komunikaci s Klientem a uvádění referencí. Údaje uchovává po dobu nezbytnou pro tyto účely.'),
    block('11.2 Subjekt údajů má právo na přístup k údajům, jejich opravu, výmaz a omezení zpracování, právo vznést námitku a právo podat stížnost u Úřadu pro ochranu osobních údajů. Práva lze uplatnit na e-mailu petr@slant.cz.'),

    h2('12. Ukončení spolupráce'),
    block('12.1 Smlouvu uzavřenou na dobu neurčitou (např. průběžnou spolupráci) může kterákoli strana písemně vypovědět s výpovědní dobou jednoho měsíce, která začíná běžet prvním dnem měsíce následujícího po doručení výpovědi.'),
    block('12.2 Kterákoli strana může od smlouvy odstoupit, poruší-li druhá strana podstatně své povinnosti a nezjedná-li nápravu ani v dodatečné lhůtě 14 dnů od písemné výzvy.'),
    block('12.3 Ustanovení čl. 5.4, 6, 8, 9 a 10 trvají i po ukončení smlouvy.'),

    h2('13. Závěrečná ustanovení'),
    block('13.1 Právní vztahy mezi Poskytovatelem a Klientem se řídí právem České republiky. Spory s Klienty, kteří jsou podnikateli, rozhoduje věcně příslušný soud podle sídla Poskytovatele.'),
    block('13.2 Spotřebitel může podat návrh na mimosoudní řešení spotřebitelského sporu u České obchodní inspekce (www.coi.cz).'),
    block('13.3 Poskytovatel je oprávněn VOP měnit. Pro smlouvu platí znění VOP účinné ke dni jejího uzavření. O změně VOP u trvající spolupráce Poskytovatel Klienta písemně informuje nejméně 30 dní předem. Klient má právo změnu odmítnout a smlouvu z tohoto důvodu vypovědět.'),
    block('13.4 Pro účely těchto VOP se za písemnou formu považuje i komunikace e-mailem.'),
    block('13.5 Je-li nebo stane-li se některé ustanovení VOP neplatným či neúčinným, ostatní ustanovení zůstávají v platnosti.'),
    block('13.6 Tyto VOP nabývají účinnosti dnem 3. 11. 2026 a nahrazují předchozí znění.'),
    block('V Brně dne 3. 11. 2026'),
  ],
  bodyEn: [
    h2('1. Introduction'),
    block('1.1 These Terms and Conditions (the “Terms”) govern, in accordance with Section 1751 et seq. of Act No. 89/2012 Coll., the Czech Civil Code (the “Civil Code”), the rights and obligations between Slant, s.r.o., Company ID 092 50 239, VAT ID CZ09250239, registered office Zborovská 940/2a, Žabovřesky, 616 00 Brno, Czech Republic, entered in the Commercial Register maintained by the Regional Court in Brno, Section C, File 118048 (the “Provider”), and its clients (the “Client”).'),
    block('1.2 These Terms apply to all services of the Provider, in particular brand creation and brand strategy, naming, visual identity, graphic, UX/UI and digital design, and related creative and consulting services (the “Services”), and to the results of the Services (the “Work”).'),
    block('1.3 These Terms are intended primarily for Clients who are businesses or legal entities entering into a contract in the course of their business. Where the Client is a consumer, these Terms apply only to the extent they do not conflict with consumer protection law. Statutory consumer rights remain unaffected.'),
    block('1.4 Provisions of an individual contract, proposal or order take precedence over these Terms.'),

    h2('2. Conclusion of Contract and Acceptance of Terms'),
    block('2.1 A contract between the Provider and the Client is concluded when the Client confirms the Provider’s proposal in writing (including by e-mail), signs a contract, pays an advance invoice, or commissions work from the Provider and the Provider begins performing it.'),
    block('2.2 By entering into cooperation in any of the ways set out in Clause 2.1, the Client confirms that they have read and agree to these Terms. This includes consent to the presentation of the Work and to the Client being named as a reference under Clause 8. These Terms form an integral part of every contract between the Provider and the Client. The Provider refers to them in its proposals and they are permanently available at www.slant.cz.'),
    block('2.3 The scope of the Services, price, timeline and number of revision rounds are agreed in the proposal or contract (the “Brief”). Work beyond the Brief is carried out upon the Client’s approval and invoiced separately.'),

    h2('3. Cooperation and Client’s Obligations'),
    block('3.1 The Client shall provide the Provider with materials, information, feedback and access needed for performance in a timely and complete manner. The Client is responsible for ensuring that the materials it supplies (in particular texts, photographs, logos and data) do not infringe third-party rights.'),
    block('3.2 If the Client is late in providing cooperation, deadlines are extended by the length of the delay. If the delay exceeds 30 days, the Provider may suspend work and invoice the work performed so far.'),
    block('3.3 The price includes the number of revision rounds stated in the Brief. If none is stated, the price includes two revision rounds. Additional revisions and changes to the Brief are charged at the Provider’s current hourly rate.'),
    block('3.4 The Provider may perform through subcontractors and is responsible for their performance as if it were its own.'),

    h2('4. Delivery and Acceptance of the Work'),
    block('4.1 The Work or a phase of it is usually delivered electronically. The Client shall review the Work without undue delay and notify the Provider of any defects or comments within 10 business days of delivery. If the Client fails to do so, or begins using the Work, the Work is deemed accepted without reservation.'),
    block('4.2 The form of the Work reflects the Provider’s professional and artistic judgement. The Client’s mere disagreement with the aesthetic approach of Work that complies with the Brief does not constitute a defect.'),
    block('4.3 Source and working files (e.g. editable files of design applications) are not part of the deliverables unless agreed otherwise in the Brief.'),

    h2('5. Price and Payment Terms'),
    block('5.1 Prices are stated exclusive of VAT, which is added at the statutory rate.'),
    block('5.2 The Provider may require an advance payment before starting work, usually 50 % of the price. The remainder is invoiced upon delivery of the Work. Long-term projects are invoiced per phase or monthly.'),
    block('5.3 Invoices are payable within 14 days of issue unless agreed otherwise. If the Client is late with payment, the Provider may charge statutory late-payment interest and suspend work until payment is made in full.'),
    block('5.4 If the Client terminates the cooperation before the Work is completed for reasons not attributable to the Provider, the Client shall pay for the work performed and costs reasonably incurred so far. Any advance paid is credited against this amount.'),

    h2('6. Copyright and Licence'),
    block('6.1 The Work may be a copyright work within the meaning of Act No. 121/2000 Coll., the Czech Copyright Act. The economic rights to the Work are exercised by the Provider.'),
    block('6.2 Upon full payment of the price, the Client obtains an exclusive licence to the final approved version of the Work for all methods of use, without territorial, time or quantity limitations. The licence includes the right to modify and adapt the Work, combine it with other works, grant sublicences and assign the licence to a third party. The licence fee is included in the price. The Client is not obliged to use the licence.'),
    block('6.3 Until the price has been paid in full, the Client may not use the Work unless agreed otherwise.'),
    block('6.4 Unselected proposals, alternatives, sketches and concepts remain with the Provider. The Client obtains no licence to them.'),
    block('6.5 The Provider may continue to use general know-how, methods and tools used or developed during performance.'),
    block('6.6 Third-party elements, in particular fonts, stock photographs, icons and software, are not covered by the licence under Clause 6.2. They are governed by the licence terms of their providers, and the Client acquires licences to them at its own cost unless agreed otherwise.'),
    block('6.7 The moral rights of the authors remain unaffected.'),

    h2('7. Names and Trademarks'),
    block('7.1 Unless a clearance search is expressly agreed, the Provider does not guarantee that a proposed name, logo or other sign can be registered as a trademark or domain, or that it does not infringe third-party rights. The Provider recommends that the Client carry out a clearance search and file a trademark application before using the sign. The Client is responsible for these steps.'),

    h2('8. Portfolio and References'),
    block('8.1 The Client grants the Provider a free-of-charge, non-exclusive consent and licence, unlimited in territory and time, to:'),
    li('present the Work and other outputs of the cooperation, including process materials and visualisations, in its portfolio, on its website, social media, in presentations, proposals, printed materials, publications and industry competitions;'),
    li('name the Client’s business name, brand name, logo and trademarks as a reference, including a brief description of the cooperation;'),
    li('state its authorship of the Work.'),
    block('8.2 In doing so, the Provider will not disclose the Client’s confidential information. Work not yet published by the Client will be presented only after its official launch or after a reasonable period has passed.'),
    block('8.3 If the Client requires the cooperation to remain confidential, or the presentation to be postponed, this must be agreed in writing before the contract is concluded. Such a request may affect the price. Any later request to restrict presentation will be considered by the Provider on a case-by-case basis.'),

    h2('9. Confidentiality'),
    block('9.1 Both parties shall keep confidential any confidential information of the other party obtained in connection with the cooperation, including after it ends. This obligation does not apply to publicly available information or where disclosure is required by law. Clause 8 remains unaffected.'),

    h2('10. Liability'),
    block('10.1 The Client is responsible for the accuracy of texts, data and materials it supplies and for the final approval of the Work, including checking print data before production.'),
    block('10.2 The total compensation the Client may claim from the Provider is limited to the price of the Work in connection with which the damage arose. This limitation does not apply to damage caused intentionally or through gross negligence, to harm to natural rights of a person, or to other cases where the law does not permit such a limitation.'),
    block('10.3 The Provider is not liable for lost profits or for damage resulting from improper use of the Work by the Client or a third party.'),

    h2('11. Personal Data Protection'),
    block('11.1 The Provider processes personal data of the Client and its contact persons as a controller in accordance with Regulation (EU) 2016/679 (GDPR) and Czech Act No. 110/2019 Coll., on the processing of personal data. Data are processed for the conclusion and performance of the contract, compliance with legal obligations and on the basis of legitimate interest, in particular for communication with the Client and listing references. Data are kept for as long as necessary for these purposes.'),
    block('11.2 Data subjects have the right of access, rectification, erasure and restriction of processing, the right to object and the right to lodge a complaint with the Czech Office for Personal Data Protection. These rights can be exercised at petr@slant.cz.'),

    h2('12. Termination'),
    block('12.1 A contract concluded for an indefinite period (e.g. ongoing cooperation) may be terminated by either party in writing with one month’s notice, starting on the first day of the month following delivery of the notice.'),
    block('12.2 Either party may withdraw from the contract if the other party materially breaches its obligations and fails to remedy the breach within an additional period of 14 days after written notice.'),
    block('12.3 Clauses 5.4, 6, 8, 9 and 10 survive termination of the contract.'),

    h2('13. Final Provisions'),
    block('13.1 Legal relations between the Provider and the Client are governed by the laws of the Czech Republic. Disputes with Clients who are businesses are decided by the competent court according to the Provider’s registered office.'),
    block('13.2 Consumers may file a proposal for out-of-court resolution of a consumer dispute with the Czech Trade Inspection Authority (www.coi.cz).'),
    block('13.3 The Provider may amend these Terms. A contract is governed by the version of the Terms in effect on the date of its conclusion. In ongoing cooperation, the Provider will notify the Client of amendments in writing at least 30 days in advance. The Client may reject the amendment and terminate the contract for that reason.'),
    block('13.4 For the purposes of these Terms, communication by e-mail is deemed to be in writing.'),
    block('13.5 If any provision of these Terms is or becomes invalid or ineffective, the remaining provisions remain in force.'),
    block('13.6 These Terms take effect on 3 November 2026 and replace the previous version. In case of any discrepancy, the Czech version prevails.'),
    block('Brno, 3 November 2026'),
  ],
}

console.log(`🌱  Writing ${doc._id}...`)
const result = await client.createOrReplace(doc)
console.log('✅ ', result.title)
