// One-off import: 7 blogových článků z původního webu slant.cz (2020–2021).
// Migrace na nový web — pouze CS. Cover obrázky se nahrávají ze scratchpadu.
// Spuštění:  node scripts/import-blog-2021-batch.mjs
import { createClient } from '@sanity/client'
import { readFileSync, createReadStream, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const env = Object.fromEntries(
  readFileSync(resolve('.env'), 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const token = process.env.SANITY_WRITE_TOKEN || env.SANITY_WRITE_TOKEN
if (!token) { console.error('Chybí SANITY_WRITE_TOKEN'); process.exit(1) }

const client = createClient({ projectId: 'wgpoci6t', dataset: 'production', apiVersion: '2024-01-01', token, useCdn: false })

const COVERS = '/private/tmp/claude-501/-Users-petermojzisek-Library-CloudStorage-GoogleDrive-petr-slant-cz--shortcut-targets-by-id-1UIS9vwywxHUb9ExofUnJPZdsRoqr0oEK-slant-marketing-slant-web/de6f1860-c619-4c0f-b167-79af32f46880/scratchpad/covers'

// ─── Portable Text helpers ────────────────────────────────────────────────────
let k = 0
const key = () => `b${k++}`

// parts: string | { t, href?, strong?, em? }  (array or single)
function children(parts) {
  const arr = Array.isArray(parts) ? parts : [parts]
  const markDefs = []
  const kids = arr.map(p => {
    if (typeof p === 'string') return { _type: 'span', _key: key(), text: p, marks: [] }
    const marks = []
    if (p.strong) marks.push('strong')
    if (p.em) marks.push('em')
    if (p.href) {
      const mk = key()
      markDefs.push({ _type: 'link', _key: mk, href: p.href })
      marks.push(mk)
    }
    return { _type: 'span', _key: key(), text: p.t, marks }
  })
  return { kids, markDefs }
}
function mk(style, parts, extra = {}) {
  const { kids, markDefs } = children(parts)
  return { _type: 'block', _key: key(), style, markDefs, children: kids, ...extra }
}
const para = (parts) => mk('normal', parts)
const h2 = (text) => mk('h2', text)
const quote = (parts) => mk('blockquote', parts)
const li = (parts) => mk('normal', parts, { listItem: 'bullet', level: 1 })
const oli = (parts) => mk('normal', parts, { listItem: 'number', level: 1 })

async function uploadCover(file, alt) {
  const path = resolve(COVERS, file)
  if (!existsSync(path)) { console.warn(`  ⚠ cover chybí: ${file}`); return null }
  const asset = await client.assets.upload('image', createReadStream(path), { filename: file })
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id }, alt }
}

// ─── Články ────────────────────────────────────────────────────────────────────
const articles = [
  {
    _id: 'blog-post-co-je-branding-proc-ho-potrebuji',
    title: 'Co je branding? Proč ho potřebuji?',
    slug: 'co-je-branding-proc-ho-potrebuji',
    category: 'Branding',
    publishedAt: '2021-01-21T15:00:00.000Z',
    description: 'Branding je nástroj, který dává značce přidanou hodnotu a odlišuje ji od ostatních na trhu. Přečtěte si, co je branding a proč byste ho neměli opomíjet při budování vaší značky. Se silnou značkou totiž můžete být dražší než konkurence a přesto se vám bude dařit.',
    cover: 'co-je-branding-proc-ho-potrebuji.jpg',
    coverAlt: 'Co je branding',
    body: () => [
      para('Určitě už jste to slovo někdy slyšeli – branding.'),
      para('Co to ale doopravdy znamená? K čemu takový branding slouží? A proč by mu podnikatelé měli věnovat pozornost?'),
      para('Existuje celá řada firem, které si lámou hlavu nad tím, proč nemají zákazníky. Utrácejí peníze za marketéry, žhaví PPC kampaně a pořádají soutěže. Ne vždy to ale funguje přesně podle představ. Proč? Protože spousta firem branding podceňuje.'),
      para('Branding je nástroj, který dává značce přidanou hodnotu a odlišuje ji od ostatních na trhu.'),
      para('Je to dlouhodobá disciplína. Pokud chcete být v brandingu úspěšní, musíte něco obětovat. Věřte však, že se investice do brandingu může hodně vyplatit.'),
      para('Je to jako s kulturistikou. Chcete se nafouknout? Jezte steroidy. Chcete být ale doopravdy silní? Trénujte pravidelně a poctivě.'),
      para('Trénovat pravidelně a poctivě znamená v případě brandingu dlouhodobě budovat svou značku na pevných hodnotách.'),
      para('Tento článek vám pomůže udělat si jasno v tom, co je branding, a ukáže vám, že existují i jiné konkurenční nástroje než nižší cena.'),
      para('Slovníček pojmů:'),
      li([{ t: 'brand', strong: true }, ' = značka']),
      li([{ t: 'branding', strong: true }, ' = budování značky']),
      h2('Co branding není'),
      li('Branding není jen logo.'),
      li('Branding není jen jednotný vizuální styl.'),
      li('Branding není jen marketing.'),
      li('Branding je tohle vše a ještě něco navíc.'),
      h2('Co branding je'),
      li('Branding je duše vaší firmy.'),
      li('Branding je pocit zákazníka z vašich služeb či produktů.'),
      li('Branding je propojení strategie a kreativity.'),
      li('Branding je nástroj k budování vztahu a důvěry mezi vaší značkou a zákazníkem.'),
      li('Branding je kontinuální proces vedení vaší značky k úspěchu.'),
      h2('Co branding dělá'),
      li('Branding vás odlišuje od konkurence.'),
      li('Branding vypráví váš příběh.'),
      li('Branding buduje vaši konkurenceschopnost.'),
      li('Branding vytváří přidanou hodnotu vašemu produktu.'),
      h2('Dobré brandy mají charisma!'),
      para('Brandy jsou jako osobnosti. Lídři většinou mají charisma a umí být inspirativní, zábavní, pouční… Podobně je tomu u značek. Ty úspěšné mají příběh.'),
      para('Charismatické značky jsou v očích zákazníků nenahraditelné.'),
      para('Mají jasno ve své pozici na trhu, jsou věrohodné, estetické a inspirativní. Estetika hraje velkou roli. Lidově řečeno – lidé vybírají očima. Kupujete produkty podle obalu? Já zčásti určitě ano. Jsme unavení přeinformovaností dnešního světa a nemáme čas do detailu zkoumat každý produkt. Proto při nákupu rozhodují naše emoce. Emoce vyvolává estetika. Estetika vychází ze strategie. Strategie vychází z pozice značky na trhu, jejích základních atributů a klíčových konkurenčních výhod.'),
      para('Vezměme si příklad. Vybavíte si logo Applu? Nepochybně ano! Důležité je, jaký máte pocit, když se na něj díváte. Je to hněv, radost, nebo snad zamilovanost? Váš pocit je výsledek brandingu. Je to souhrn toho, jak na vás značka působí na základě vašich osobních zkušeností a jak ji vnímáte jako celek.'),
      para('Značka je komplexní struktura, kterou si každý vykládá po svém. Jednotlivci tak vidí brand svým unikátním pohledem a pro vás jako strůjce brandu je důležité, co o něm lidé řeknou ostatním.'),
      quote([{ t: '„Branding je to, co o vaší značce říkají oni, ne vy.“ – Marty Neumeier, The Brand Gap', em: true }]),
      para('Představte si značku, kterou máte opravdu rádi, a odpovězte si proč.'),
      para('Tipnete si, kterou značku mám rád já? Bravo! Je to právě Apple.'),
      para('Proč? Protože jejich produkty jsou inovativní, funkční a estetické. Jejich značka nabízí něco jiného než konkurence a má charisma. Zákaznický servis je také na vysoké úrovni. Příjemné překvapení například bylo, když mi Apple napsal, že evidují vadnou baterii v mém zařízení a zdarma mi ji vymění.'),
      para('To je prozákaznický přístup jedna báseň a krásný příklad toho, jak se lovebrand chová ke svému zákazníkovi!'),
      para('Po těchto zkušenostech důvěřuji Applu daleko víc a pravděpodobně u něj koupím ještě několik dalších počítačů. Vůbec mě netrápí, že si připlatím. Kvalita a servis, který dostávám, jsou pro mě daleko víc než cenová úspora.'),
      para('Nechci tady kalifornskou společnost vychvalovat do nebes. Jde o princip. Rozumíte mi?'),
      para('Branding je hlavně o důvěře zákazníka ve značku.'),
      para('Čím víc vám zákazník důvěřuje, tím větší je šance, že bude k vaší značce loajální. Takto vybudujete kvalitní zákaznickou základnu a silnou značku s jasnou pozicí na trhu.'),
      para('Se silnou značkou pak můžete být dražší než konkurence, a přesto se vám bude dařit.'),
      para('Důvěryhodnost je zkratka k nákupu!'),
      para('Potřebujete poradit nebo máte na nás nějaké otázky? Velmi rádi vám je zodpovíme.'),
    ],
  },

  {
    _id: 'blog-post-proc-brandingova-agentura',
    title: 'Proč brandingová agentura?',
    slug: 'proc-brandingova-agentura',
    category: 'Behind the scenes',
    publishedAt: '2020-11-09T11:34:00.000Z',
    description: 'O tom, proč jsme se rozhodli založit novou agenturu zaměřenou na branding, co to vlastně znamená a jak jsme se dostali od prvního loga až k celým brandům.',
    cover: 'proc-brandingova-agentura.jpg',
    coverAlt: 'Studio Slant',
    body: () => [
      para('Nebudu začínat klasickým pohádkovým úvodem „kdysi dávno“ ani Poláčkovým „bylo nás pět“. I když pět nás na začátku opravdu bylo. Chci začít rovnou tím, kdo jsme, co nás svedlo dohromady a proč jsme se rozhodli založit si právě agenturu na branding a grafický design. Povím vám taky, jak jsme si uvědomili, že pojem individualita není v designu to správné slovo.'),
      quote([{ t: 'Individualita není v designu to správné slovo.', em: true }]),
      h2('Jak se to stalo'),
      para('Nejprve bych nás rád v krátkosti představil. Já (Michal) a Petr, kterému přezdíváme Mojža, se vlastně známe docela krátce. Co nás ale svedlo dohromady, byl společný sen vytvořit si v Brně otevřenou dílnu. Však to znáte! Takovou tu dílnu, kam si můžete jít za dvě stovky na hodinu uříznout prsty na cirkulárce.'),
      para('No dobře! Nechtěli jsme lidem úplně řezat prsty, ale spíš vytvořit něco unikátního. Sdílený prostor, kde by si lidé mohli půjčit vybavení, které sami nemají, a opravit si třeba židli, svařit branku nebo vyrobit tričko na kola. Každý jsme měli něco, co jsme chtěli v dílně zužitkovat.'),
      quote([{ t: 'Měli jsme společný sen vytvořit si v Brně otevřenou dílnu.', em: true }]),
      para('Já jsem si prošel snad každou prací na planetě. Ano, i v mekáči jsem dělal. Odjakživa jsem ale miloval grafický design a s trochou programátorského skillu jsem dělal i weby. Mojí velkou vášní bylo tisknutí triček. Dokonce až takovou, že jsme si s kamarádem udělali vlastní prototyp sítotiskového karuselu. Tiskl jsem na něm trička pro kamarády a rodinu snad na každou příležitost. Svatby, narozeniny, voda, rozlučky, nebo jen tak do hospody. Prostě stovky triček a vždy s mým vlastním designem.'),
      para('Mojža vystudoval produktový design v Ostravě a tvořil návrhy stánků pro brněnské výstaviště. Rád cestuje a jeho natuněná videa z dovolených mě inspirovala k tomu, abych vzal kameru do ruky taky. Co mě na něm ale vždy fascinovalo nejvíc, bylo to, že měl vlastní dílničku na surfy. Čtete správně! Ve městě, kde je nejbližší přirozená vlna 1000 km daleko, vyráběl surfy.'),
      para('Mojža nosil v hlavě nápad na už zmíněnou otevřenou dílnu v Brně. Dal proto dohromady tým pěti kamarádů a já jsem měl to štěstí, že jsem v něm mohl být taky. Tak se stalo, že jsme se potkali u jednoho stolu a začali pracovat na našem prvním společném projektu.'),
      h2('Design nás pohltil'),
      para('Otevřít si dílnu ale není úplně tak jednoduché, jak jsme si na začátku mysleli. Domluvit se a shodnout se na něčem v pěti lidech bylo snad to nejtěžší. To už vás možná napadlo, protože pracovat s rodinou nebo s kamarády je někdy oříšek, natožpak v pěti lidech. Někteří z vás to možná znáte z vlastní zkušenosti. Radím vám, jako všichni radili mému naivnímu já před pěti lety – nedělejte to!'),
      para('Pro otevření dílny jsme potřebovali nejdřív prostory, vybavení, peníze a čas. Především hodně peněz a hodně času. Tak nějak spontánně jsme dostali nápad, že si na to vyděláme tím, co umíme a co nás baví. Začali jsme proto dělat na zakázku grafiku, weby a produkci různých reklamních předmětů – od samolepek přes trička až po polepy aut. Vedle toho byl samozřejmě každý z nás pořád ve své dosavadní práci.'),
      para('My s Mojžou jsme se věnovali především tvorbě grafiky a webů. Tady jsme pomalu začali zjišťovat, že naše dřívější bokovky na živnost dostávaly jiný rozměr, když jsme na nich dělali společně. Zjistili jsme, že v designu opravdu individualita není to správné slovo.'),
      para('Pomalu jsme přecházeli od individuálních zakázek, jako byl návrh vizitky pro kamarády, ke komplexním projektům, jako je třeba tvorba firemní identity. To nám hodně finančně pomohlo ke splnění našich cílů. Po dvou letech jsme našli skvělé prostory v centru Brna a konečně otevřeli něco, čemu se dalo říkat dílna.'),
      quote([{ t: 'Naše práce začala dostávat jiný rozměr, když jsme na ní dělali společně.', em: true }]),
      para([{ t: 'Během toho jsme vytvořili redesign eventové akce Burger Street Festival a začali jsme dělat pro město Brno „Zprávu o stavu města“. Měli jsme také možnost podílet se na spoustě skvělých menších ' }, { t: 'projektů', href: 'https://slant.cz/projekty/' }, { t: ', jakými byly třeba kosmetická řada pro muže ProfiMen nebo e-shop s konopnými olejíčky Konopný táta.' }]),
      para('Tyhle projekty nás opravdu bavily! Začali jsme se brandingu věnovat naplno a čím dál víc upozaďovat činnosti v dílně. Konečně jsme viděli smysl v tom, že svými zkušenostmi můžeme pomoct někomu dalšímu.'),
      para('A pak přišla pandemie (covid-19).'),
      h2('Jenom šílenci zakládají agenturu v pandemii'),
      para('Co dál? Spousta firem začala šetřit, zakázek moc nebylo, dílna se vlastně nikdy pořádně nerozběhla a v prostorách byla jen spousta harampádí. To nás s Mojžou donutilo začít přemýšlet nad tím, kudy se bude naše cesta ubírat dál. Milovali jsme budování brandů a péči o značky. Tisk triček, tvorba surfů a jiné menší projekty, to byl vlastně spíš jen koníček. Tým pěti lidí kolem dílny se navíc na ničem nedomluvil. Tak jsme si řekli, že když na to teď máme víc klidu, můžeme pracovat na sobě.'),
      para('Udělali jsme si poctivě brand audit a vyjasnili si, co přesně chceme dělat. To nám trvalo skoro půl roku. Začali jsme tím, že jsme ze svého portfolia činností vyškrtali nadbytečné služby.'),
      para([{ t: 'Dali jsme dohromady koncept brandingové agentury, protože to nám dávalo největší smysl. Ve ' }, { t: 'Slantu', href: 'https://slant.cz/studio/' }, { t: ' chceme především tvořit značky a pomáhat jim růst. Zaměřujeme se na to, abychom udělali důkladnou analýzu vašeho podnikání a pak vám pomohli s firemní identitou nebo vizuálním stylem. V tom jsme silní! Ve spojení obsahu s designem. Proto jsme také vybrali slovo agentura, a ne grafické studio nebo reklamka. Možná z toho slova máte kopřivku, ale my se chceme na věci dívat z ptačí perspektivy a efektivně pomáhat vašemu podnikání. To pro nás slovo agentura vystihuje perfektně.' }]),
      para('Zbytek našeho příběhu právě sledujete na našem webu nebo instagramu. Chceme dál růst a nechceme na to být sami. Přibrali jsme proto k sobě do týmu, tentokrát externě, další dva skvělé lidi: markeťáka Milana a grafika Ondru. Jak už jsem psal, naučili jsme se, že dobře postavený tým je lepší než jeden nadaný grafik.'),
      h2('Babička říkala, že je to o hubu'),
      para('Moje babička je stará škola a vždycky mi říká, že jsem „úplnej blázen“, když chci v téhle době podnikat. Ale jak řekl John F. Kennedy: „Neděláme to proto, že je to jednoduché, ale proto, že je to těžké.“ On měl na mysli přistání na Měsíci a my zase vybudování brandingové agentury, ale vnímáme to stejně. Jak už to totiž bývá, s těmi dobrými věcmi je to v životě vždycky trochu těžké. Každý by ale měl dělat to, co mu jde a co ho baví. Nejenže tím bude dělat radost sám sobě, ale může tak být opravdovým přínosem i pro ostatní. Pro nás je to Slant, protože víme, že vám dokážeme pomoct v tom, v čem jste dobří zase vy!'),
      quote([{ t: 'Naučili jsme se, že dobře postavený tým je lepší než jeden nadaný grafik.', em: true }]),
    ],
  },

  {
    _id: 'blog-post-brandmanual-nutnost-nebo-prezitek',
    title: 'Brandmanuál! Nutnost, nebo přežitek?',
    slug: 'brandmanual-nutnost-nebo-prezitek',
    category: 'Branding',
    publishedAt: '2021-02-11T11:00:00.000Z',
    description: 'Je klasický brandmanuál přežitek, nebo stále standard? Přečtěte si, jaké online nástroje nahrazují klasické PDF manuály a jak připravit manuál, se kterým klient opravdu umí pracovat.',
    cover: 'brandmanual-nutnost-nebo-prezitek.jpg',
    coverAlt: 'Brandmanuál',
    body: () => [
      para('Brandmanuál! 📙 Drbat se s ním, nebo nedrbat? Jak pomáhá designérům v jejich práci? A jak jím naopak vytyčit mantinely značky?'),
      para('Velké téma posledních let jsou online nástroje pro tvorbu jednotných vizuálních stylů. PDF is dead 💀'),
      para('Shodli jsme se, že udržovat brand jen v PDF podobě je skoro nemožné. Čím tedy nahradit starou dobrou knižní podobu brandmanuálů?'),
      para('Netvrdím, že je potřeba zahodit krásnou sazbu. Pro nás milovníky „NASA like“ papírové podoby na poličce je to k nezaplacení. Ta je ale spíš pro profesně deformované, jako jsem já. Jak tedy připravit dobrý a funkční manuál pro klienta?'),
      para('Skvělý přístup je připravit pro klienta a zaměstnance krátkou prezentaci. Vysvětlit jim v lidské a třeba i zábavné formě, jak vůbec s manuálem pracovat. Vytyčit, kde jsou hranice self-service řešení a kdy oslovit grafika. Tohle by rozhodně nemělo chybět v žádném manuálu. Klient často netuší, co je CMYK, a sáhne po tom, co mu připadá nejvhodnější.'),
      para('Must have každého brandmanuálu je uvádět na sebe kontakt! Setkávám se s tím pořád dokola, že chybí.'),
      para('Další skvělý přístup je přidávat odkaz na svou export složku – ať už na Google Drive, Dropbox nebo jiné cloudové řešení. Zde ale přicházejí problémy. Klient nemůže něco dohledat, grafik se nedokáže zorientovat ve struktuře a jak vůbec zabezpečit citlivé dokumenty?'),
      para('Tady vstupují do hry nástroje jako:'),
      li([{ t: 'Brandcloud', href: 'https://www.brandcloud.pro/' }]),
      li([{ t: 'Canva', href: 'https://www.canva.com/' }]),
      li([{ t: 'Frontify', href: 'https://www.frontify.com/' }]),
      li([{ t: 'Brandfolder', href: 'https://brandfolder.com/' }]),
      li([{ t: 'Brandmaster', href: 'https://www.brandmaster.com/' }]),
      li([{ t: 'Bynder', href: 'https://www.bynder.com/' }]),
      li([{ t: 'Swivle', href: 'https://www.swivle.com/' }]),
      para([{ t: 'Pro mě osobně jsou tyto ' }, { t: 'služby', href: 'https://slant.cz/sluzby/' }, { t: ' spíš marketingové nástroje na správu velkého brandu. Cílí, i cenou, spíš na interní marketingové týmy, popřípadě větší agentury.' }]),
      para([{ t: 'Po čem sáhnout jako freelancer nebo menší agentura? Určitě stojí za zmínku ' }, { t: 'Visualbook', href: 'https://visualbook.pro/' }, { t: ' od Jiřího Chlebuse. Dále jsou tu skvělé nástroje jako:' }]),
      li([{ t: 'Corebook', href: 'https://www.corebook.io/' }]),
      li([{ t: 'Brandpad', href: 'https://brandpad.io/' }]),
      para([{ t: 'Jako inspiraci jsem zmiňoval třeba skvělý ' }, { t: 'online manuál pro Uber', href: 'https://brand.uber.com/' }, { t: '. Co mi u těchto nástrojů ale trochu chybí, je hlubší integrace s úložištěm. Nezůstat jen u odkazu na Google Disk, ale integrovat aktuální export přímo do stránky online logomanuálu – to by bylo skvělé.' }]),
    ],
  },

  {
    _id: 'blog-post-cms-nastroje-je-wordpress-budoucnost-nebo-uz-minulost',
    title: 'CMS nástroje. Je WordPress budoucnost, nebo už minulost?',
    slug: 'cms-nastroje-je-wordpress-budoucnost-nebo-uz-minulost',
    category: 'Studio',
    publishedAt: '2021-02-08T17:22:00.000Z',
    description: 'Dá se WordPress nahradit jinými CMS nástroji? Webflow, Wix, Squarespace… Tyto a jiné otázky jsme probrali a sepsali, o čem debata byla a jaké tipy z ní vzešly.',
    cover: 'cms-nastroje-je-wordpress-budoucnost-nebo-uz-minulost.jpg',
    coverAlt: 'CMS nástroje — WordPress',
    body: () => [
      para('Nejožehavější téma bylo určitě, jestli je WordPress stále aktuální web builder. Jasně jsme se shodli na tom, že je to robustní aplikace, která může zastrašit nejednoho klienta. Zároveň ale stále tvoří největší komunitu webů, a proto je v něm možné prakticky cokoliv.'),
      para([{ t: 'Náročnost WordPressu na údržbu byla také jedno z velkých témat. Zde vstupovaly do hry alternativy jako ' }, { t: 'Webflow', href: 'https://webflow.com' }, { t: ', ' }, { t: 'Wix', href: 'https://wix.com' }, { t: ' nebo ' }, { t: 'Squarespace', href: 'https://squarespace.com' }, { t: '.' }]),
      para('Nejvíc diskutované bylo rozhodně Webflow. Vedle výhod, jako je extrémní důraz na design a rychlost, má velký náskok právě v údržbě. Kvalitou kódu mu WordPress také nemůže konkurovat. V čem ale WordPress stále vyhrává, je obrovská komunita vývojářů. Není se tak třeba bát, že by něco nešlo.'),
      para('Já mám rozhodně v plánu ponořit se do vod Webflow hlouběji a těším se, co všechno mi umožní. 🤓'),
      para('Za zmínku stojí také pluginy pro WordPress, které mnozí zmiňovali a mohly by ho vrátit zpátky do hry. Tady jsou některé z nich:'),
      li([{ t: 'Oxygen', href: 'https://oxygenbuilder.com/' }]),
      li([{ t: 'Brizy', href: 'https://brizy.io/' }]),
      li([{ t: 'Divi (Elegant Themes)', href: 'https://elegantthemes.com/' }]),
      li([{ t: 'Elementor', href: 'https://elementor.com/' }]),
      para('Oxygen mě zatím zaujal nejvíc a hodlám se na něj podívat detailněji.'),
    ],
  },

  {
    _id: 'blog-post-graficke-nastroje-v-roce-2021',
    title: 'Grafické nástroje v roce 2021',
    slug: 'graficke-nastroje-v-roce-2021',
    category: 'Studio',
    publishedAt: '2021-02-04T11:05:00.000Z',
    description: 'Jaké grafické nástroje ovládají svět designérů, grafiků, fotografů, videotvůrců a dalších kreativních profesí? Přečtěte si, co se nám osvědčilo a čím se dá nahradit Adobe.',
    cover: 'graficke-nastroje-v-roce-2021.jpg',
    coverAlt: 'Grafické nástroje 2021',
    body: () => [
      para('Bylo to poučné, rozsáhlé a určitě bylo i co si odnést. Například věčná debata Adobe vs. zbytek světa. Čím se dají nahradit nástroje Adobe a v čem je naopak Adobe nenahraditelné?'),
      para([{ t: '🖌 Nejvíc skloňované bylo ' }, { t: 'Affinity', href: 'https://affinity.serif.com/' }, { t: '. Všem ho doporučuju jako „new must have“.' }]),
      para([{ t: '📱 Dále jsme zmiňovali UX nástroje jako Figma, Sketch, InVision a další. ' }, { t: 'Figma', href: 'https://www.figma.com/' }, { t: ' je pro nás v tomto oboru jednohlasně vítězem.' }]),
      para('Za zmínku stojí další nástroje jako:'),
      li([{ t: 'Cavalry', href: 'https://cavalry.scenegroup.co/' }, ' — 2D animace']),
      li([{ t: 'Blender', href: 'https://www.blender.org/' }, ' — 3D program']),
      li([{ t: 'FontLab', href: 'https://www.fontlab.com/' }, ' — tvorba písma']),
      li([{ t: 'Glyphs', href: 'https://glyphsapp.com/' }, ' — tvorba písma']),
      li([{ t: 'SVGator', href: 'https://www.svgator.com/' }, ' — SVG animace']),
      li([{ t: 'Lottie', href: 'https://airbnb.design/lottie/' }, ' — knihovna pro snadnou integraci animací do webu a nativních aplikací']),
      li([{ t: 'RightFont', href: 'https://rightfontapp.com/' }, ' — font manager']),
      li([{ t: 'Adobe Color', href: 'https://color.adobe.com/' }, ' — inspirace v oblasti barev a barevných trendů']),
      li([{ t: 'Coolors', href: 'https://coolors.co/' }, ' — vytváření barevných kombinací']),
      li([{ t: 'papersizes.io', href: 'https://papersizes.io/' }, ' — tiskové rozměry']),
      li([{ t: 'Fonts In Use', href: 'https://fontsinuse.com/' }, ' — inspirace z typografie']),
      li([{ t: 'Trendlist', href: 'https://trendlist.org/' }, ' — aktuální trendy v designu']),
      li([{ t: 'Designspiration', href: 'https://designspiration.com/' }, ' — něco jako Pinterest']),
      para('Díky za debatu a příště zase na slyšenou. 🤝'),
    ],
  },

  {
    _id: 'blog-post-produktivita-v-designu',
    title: 'Produktivita v designu',
    slug: 'produktivita-v-designu',
    category: 'Studio',
    publishedAt: '2021-02-26T11:00:00.000Z',
    description: 'Není nic lepšího než celé dny hledat nástroj, který vám pomůže udělat práci efektivněji, místo toho abyste tu práci udělali. Ušetřili jsme vám čas a sepsali pár tipů na skvělé nástroje, které byste měli zařadit do svého kreativního procesu. Produktivita není sprosté slovo!',
    cover: 'produktivita-v-designu.jpg',
    coverAlt: 'Produktivita v designu',
    body: () => [
      para('Jsem hrozně rád, že nejsem jediný nerd na světě, který hledá svatý grál all-in-one nástroje pořád dokola. Znáte to – někdy si člověk připadá blbě, že prokrastinuje a hledá nástroj, který mu zorganizuje práci, místo toho, aby ji udělal. Ale nebojte, nejste v tom sami!'),
      para([{ t: 'Nejdéle jsme se bavili o nástroji ' }, { t: 'Milanote', href: 'https://milanote.com/' }, { t: '. Pro kreativce je to skvělý organizační nástroj a mluvili jsme i o jeho možném využití pro tvorbu jednoduchých online brandmanuálů.' }]),
      para([{ t: 'U nás v agentuře využíváme ' }, { t: 'Jiru', href: 'https://www.atlassian.com/software/jira' }, { t: '. Je to ale robustní nástroj, tak trochu kanón na vrabce. Jira kromě standardního kanbanu umožňuje plánovat roadmapu pro marketing a také vytvářet kalkulace a faktury. To vnímám jako velkou přednost. Pro tradiční projektový management tak nepotřebujeme víc programů, což nám usnadňuje práci s velkými ' }, { t: 'projekty', href: 'https://slant.cz/projekty/' }, { t: ', jako je třeba ' }, { t: 'Story by Jakub', href: 'https://slant.cz/projekty/osobni-znacka-story-by-jakub/' }, { t: '.' }]),
      para('Když budete mít chuť a čas se podívat, přikládám další tipy na skvělé programy:'),
      li([{ t: 'Milanote', href: 'https://milanote.com/' }, ' — organizace pro kreativce']),
      li([{ t: 'Jira (Atlassian)', href: 'https://www.atlassian.com/software/jira' }, ' — spíš pro vývoj softwaru']),
      li([{ t: 'Trello', href: 'https://trello.com/' }, ' — kanban pro organizaci práce']),
      li([{ t: 'Monday', href: 'https://monday.com/' }, ' — velmi flexibilní nástroj pro projektový management']),
      li([{ t: 'GoVisually', href: 'https://govisually.com/' }, ' — skvělý nástroj pro kolaboraci kreativních týmů']),
      li([{ t: 'Asana', href: 'https://asana.com/' }, ' — velký konkurent Jiry']),
      li([{ t: 'ClickUp', href: 'https://clickup.com/' }, ' — moc pěkně zpracovaný nástroj pro projektový management']),
      para('Z menších utilit, které by vám mohly pomoct efektivněji komunikovat nebo plánovat den, jsme vyzdvihli tyto:'),
      li([{ t: 'Slack', href: 'https://slack.com/' }, ' — skvělý komunikační nástroj pro týmy']),
      li([{ t: 'Basecamp', href: 'https://basecamp.com/' }, ' — velmi populární nástroj pro organizaci v týmu']),
      li([{ t: 'Miro', href: 'https://miro.com/' }, ' — whiteboard v reálném čase pro týmy']),
      li([{ t: 'MindMup', href: 'https://www.mindmup.com/' }, ' — nástroj pro tvorbu myšlenkových map']),
      li([{ t: 'Notion', href: 'https://www.notion.so/' }, ' — organizace týmu i jednoduché poznámky']),
      li([{ t: 'Abstract', href: 'https://www.abstract.com/' }, ' — nástroj pro zpřehlednění kreativního procesu']),
      li([{ t: 'Todoist', href: 'https://todoist.com/' }, ' — skvělý to-do list']),
      li([{ t: 'TeuxDeux', href: 'https://teuxdeux.com/' }, ' — další jednoduchý to-do list']),
      li([{ t: 'TasksBoard', href: 'https://tasksboard.app/' }, ' — rozšíření pro Google úkoly']),
      para('Těšíme se na další skvělé povídání s vámi! ☀️'),
    ],
  },

  {
    _id: 'blog-post-online-utility-pro-designery',
    title: 'Online utility pro designéry',
    slug: 'online-utility-pro-designery',
    category: 'Studio',
    publishedAt: '2021-02-17T09:00:00.000Z',
    description: 'Sepsali jsme pro vás dlouhý, ale rozhodně užitečný seznam online utilit pro designéry — od optimalizace obrázků přes generátory barevných palet až po mockupy a inspiraci. Enjoy!',
    cover: 'online-utility-pro-designery.jpg',
    coverAlt: 'Online utility pro designéry',
    body: () => [
      para('Prošli jsme dlooouhej seznam skvělých utilit pro designéry. Prošel jsem všechny zmíněné a rozdělil je do tematických kategorií. A že je z čeho vybírat! Tady jsou:'),
      h2('Foto'),
      li([{ t: 'everypixel.com', href: 'https://www.everypixel.com/' }, ' — vyhledávač obrázků zdarma']),
      li([{ t: 'remove.bg', href: 'https://www.remove.bg/' }, ' — odstraňovač pozadí']),
      li([{ t: 'tinypng.com', href: 'https://tinypng.com/' }, ' — optimalizace obrázků']),
      li([{ t: 'SVGO', href: 'https://jakearchibald.github.io/svgomg/' }, ' — optimalizace SVG']),
      h2('Grafika'),
      li([{ t: 'undraw.co', href: 'https://undraw.co/' }, ' — open source ilustrace']),
      li([{ t: 'flaticon.com', href: 'https://www.flaticon.com/' }, ' — databáze ikon']),
      li([{ t: 'thenounproject.com', href: 'https://thenounproject.com/' }, ' — vyhledávač ikon a fotek']),
      li([{ t: 'infogram.com', href: 'https://infogram.com/' }, ' — tvorba infografik']),
      h2('Barvy'),
      li([{ t: 'emotivefeels.com', href: 'https://emotivefeels.com/' }, ' — barvy podle emocí']),
      li([{ t: 'coolors.co', href: 'https://coolors.co/' }, ' — generátor barevných palet']),
      li([{ t: 'mycolor.space', href: 'https://mycolor.space/' }, ' — generátor barevných palet']),
      li([{ t: 'colormind.io', href: 'http://colormind.io/' }, ' — generátor barevných palet']),
      li([{ t: 'colorable.jxnblk.com', href: 'https://colorable.jxnblk.com/' }, ' — kontrola kontrastu textu']),
      h2('Typografie'),
      li([{ t: 'type-scale.com', href: 'https://type-scale.com/' }, ' — kalkulátor velikosti písma']),
      li([{ t: 'freefaces.gallery', href: 'https://freefaces.gallery/' }, ' — open source fonty']),
      li([{ t: 'rightfontapp.com', href: 'https://rightfontapp.com/' }, ' — manažer fontů za dobrý peníz']),
      li([{ t: 'Kerntype', href: 'https://type.method.ac/' }, ' — naučte se kerning ;)']),
      h2('Mockupy'),
      li([{ t: 'templatemaker.nl', href: 'https://www.templatemaker.nl/en/' }, ' — vytvořte si síť pro krabičku']),
      li([{ t: 'smartmockups.com', href: 'https://smartmockups.com/' }, ' — online nástroj pro tvorbu produktových mockupů']),
      li([{ t: 'design.facebook.com', href: 'https://design.facebook.com/toolsandresources/devices/' }, ' — mockupy pro telefony a počítače']),
      li([{ t: 'graphicburger.com', href: 'https://graphicburger.com/' }, ' — PSD mockupy zdarma']),
      h2('Inspirace'),
      li([{ t: 'brandingstyleguides.com', href: 'https://brandingstyleguides.com/' }, ' — archiv brandmanuálů']),
      li([{ t: 'informationisbeautiful.net', href: 'https://informationisbeautiful.net/' }, ' — inspirace pro infografiky']),
      li([{ t: 'designspiration.com', href: 'https://www.designspiration.com/' }, ' — něco jako Pinterest']),
      li([{ t: 'search.muz.li', href: 'https://search.muz.li/' }, ' — vyhledávač inspirace']),
      li([{ t: 'material.io', href: 'https://material.io/' }, ' — design systém od Googlu']),
      h2('Produktivita'),
      li([{ t: 'notion.so', href: 'https://www.notion.so/' }, ' — organizace práce']),
      li([{ t: 'pureref.com', href: 'https://www.pureref.com/' }, ' — tvorba moodboardů']),
      li([{ t: 'milanote.com', href: 'https://milanote.com/' }, ' — Evernote pro kreativce']),
      h2('3D'),
      li([{ t: 'hdrihaven.com', href: 'https://hdrihaven.com/' }, ' — HDRI knihovna zdarma']),
      li([{ t: 'texturehaven.com', href: 'https://texturehaven.com/' }, ' — knihovna textur zdarma']),
      h2('Bonus pro děravé hlavy'),
      li([{ t: 'papersizes.io', href: 'https://papersizes.io/' }, ' — rozměry papírů']),
      li([{ t: 'designerstoolbox.com', href: 'http://designerstoolbox.com/designresources/' }, ' — přehled rozměrů napříč digitálem a printem']),
      li([{ t: 'theonlineadvertisingguide.com', href: 'https://theonlineadvertisingguide.com/' }, ' — průvodce online reklamou']),
      li([{ t: 'canva.com', href: 'https://www.canva.com/sizes/' }, ' — rozměry pro digitál i print']),
      para('A to je asi tak všechno…'),
    ],
  },
]

async function run() {
  for (const a of articles) {
    k = 0
    console.log(`\n▶ ${a.title}`)
    const cover = a.cover ? await uploadCover(a.cover, a.coverAlt) : null
    if (cover) console.log(`  ✓ cover nahrán`)
    const doc = {
      _id: a._id,
      _type: 'blogPost',
      title: a.title,
      slug: { _type: 'slug', current: a.slug },
      description: a.description,
      category: a.category,
      publishedAt: a.publishedAt,
      ...(cover ? { coverImage: cover } : {}),
      body: a.body(),
      featured: false,
    }
    await client.createOrReplace(doc)
    console.log(`  ✅ /blog/${a.slug}`)
  }
  console.log('\n🎉 Hotovo — ' + articles.length + ' článků.')
}

run().catch(e => { console.error(e); process.exit(1) })
