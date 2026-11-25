export const sources = {
  atlas: {
    title: 'Newberry Library, Atlas of Historical County Boundaries',
    url: 'https://publications.newberry.org/ahcb/downloads/united_states.html',
  },
  declaration: {
    title: 'National Archives, Declaration of Independence',
    url: 'https://www.archives.gov/founding-docs/declaration-transcript',
  },
  paris: {
    title: 'National Archives, Treaty of Paris',
    url: 'https://www.archives.gov/milestone-documents/treaty-of-paris',
  },
  parisRatification: {
    title: 'Yale Law School, Treaty of Paris ratification notes',
    url: 'https://avalon.law.yale.edu/18th_century/parisno.asp',
  },
  louisiana: {
    title: 'National Archives, Louisiana Purchase Treaty',
    url: 'https://www.archives.gov/milestone-documents/louisiana-purchase-treaty',
  },
  transfer: {
    title: 'Library of Congress, Louisiana legislative timeline',
    url: 'https://guides.loc.gov/louisiana-purchase-legislative-timeline/1803-1804',
  },
  convention: {
    title: 'Office of the Historian, Convention of 1818',
    url: 'https://history.state.gov/milestones/1801-1829/rush-bagot',
  },
  floridaRatification: {
    title: 'Fordham University, Adams–Onís treaty text and ratification dates',
    url: 'https://sourcebooks.web.fordham.edu/mod/1819florida.asp',
  },
  florida: {
    title: 'Office of the Historian, Acquisition of Florida',
    url: 'https://history.state.gov/milestones/1801-1829/florida',
  },
  states: {
    title: 'U.S. Senate, States in the Senate',
    url: 'https://www.senate.gov/states/statesmap.htm',
  },
  texas: {
    title: 'Office of the Historian, Texas annexation and war',
    url: 'https://history.state.gov/milestones/1830-1860/texas-annexation',
  },
  oregon: {
    title: 'Office of the Historian, Oregon boundary settlement',
    url: 'https://history.state.gov/milestones/1830-1860/oregon-territory',
  },
  oregonTreaty: {
    title: 'Library of Congress, Treaties and Other International Agreements, vol. 12',
    url: 'https://tile.loc.gov/storage-services/service/ll/lltreaties/lltreaties-ustbv012/lltreaties-ustbv012.pdf',
  },
  mexico: {
    title: 'National Archives, Treaty of Guadalupe Hidalgo',
    url: 'https://www.archives.gov/milestone-documents/treaty-of-guadalupe-hidalgo',
  },
  gadsdenTreaty: {
    title: 'Yale Law School, Gadsden treaty as amended and proclaimed',
    url: 'https://avalon.law.yale.edu/19th_century/mx1853.asp',
  },
  gadsden: {
    title: 'National Archives, Gadsden Purchase Treaty',
    url: 'https://www.archives.gov/legislative/features/nm-az-statehood/gadsden.html',
  },
  alaska: {
    title: 'Office of the Historian, Purchase of Alaska',
    url: 'https://history.state.gov/milestones/1866-1898/alaska-purchase',
  },
  hawaii: {
    title: 'National Archives, Annexation of the Hawaiian Islands',
    url: 'https://www.archives.gov/milestone-documents/joint-resolution-for-annexing-the-hawaiian-islands',
  },
  hawaiiTransfer: {
    title: 'Office of the Historian, Hawaii',
    url: 'https://history.state.gov/countries/hawaii',
  },
  hawaiiState: {
    title: 'U.S. Senate, Hawaii timeline',
    url: 'https://www.senate.gov/states/HI/timeline.htm',
  },
};
export const events = [
  {
    id: 'independence',
    date: '1776-07-04',
    title: 'Thirteen colonies declare independence',
    short: 'Independence',
    kind: 'Declaration',
    region: 'Philadelphia and the Atlantic colonies',
    scale: 1.45,
    summary:
      'Thirteen colonies announced their separation from Great Britain. Independence was a declaration, not an agreed international boundary.',
    explanation:
      'The war continued after the Declaration of Independence. No verified 1776 boundary geometry is bundled here, so this chapter shows modern geographic context only. The first historical snapshot begins with the 1783 peace treaty.',
    dates: [
      ['Declaration adopted', '1776-07-04'],
      ['Peace treaty signed', '1783-09-03'],
    ],
    sourceIds: ['declaration', 'paris'],
    match: [],
  },
  {
    id: 'treaty-of-paris',
    date: '1783-09-03',
    title: 'A republic reaches the Mississippi',
    short: 'Treaty of Paris',
    kind: 'Treaty signed',
    region: 'Eastern North America',
    scale: 1.15,
    summary:
      'Great Britain recognized the United States in a peace treaty. Its described boundaries reached west to the Mississippi River.',
    explanation:
      'This reconstruction follows treaty and state claims, not the reach of U.S. settlement or military control. Vermont is shown separately: it functioned as a republic before joining the Union in 1791. Ratifications were exchanged in 1784.',
    dates: [
      ['Treaty signed', '1783-09-03'],
      ['Ratifications exchanged', '1784-05-12'],
    ],
    sourceIds: ['paris', 'parisRatification'],
    match: ['Virginia', 'Georgia', 'North Carolina'],
    story: true,
  },
  {
    id: 'louisiana-purchase',
    date: '1803-04-30',
    title: 'The Louisiana Purchase',
    short: 'Louisiana Purchase',
    kind: 'Treaty signed',
    region: 'The Mississippi basin',
    scale: 1.15,
    summary:
      'A treaty with France extended U.S. claims across a vast part of the Mississippi basin. The borders of the purchase were not fully settled.',
    explanation:
      'The map introduces the purchase at the treaty-signing date used by the source atlas. Hatching marks the interval before the December transfer ceremony in New Orleans; Upper Louisiana was transferred separately in 1804. Indigenous nations continued to occupy and govern these lands.',
    dates: [
      ['Treaty signed', '1803-04-30'],
      ['Lower Louisiana transfer', '1803-12-20'],
    ],
    sourceIds: ['louisiana', 'transfer'],
    match: ['Louisiana Purchase'],
    story: true,
  },
  {
    id: 'convention-of-1818',
    date: '1818-10-20',
    title: 'A boundary along the 49th parallel',
    short: 'Convention of 1818',
    kind: 'Convention signed',
    region: 'Northern Great Plains',
    scale: 1.4,
    summary:
      'Britain and the United States agreed on a northern boundary west of the Lake of the Woods to the Rocky Mountains.',
    explanation:
      'The convention exchanged claims on either side of the 49th parallel. Farther west, the Oregon Country remained open to both countries under joint occupation; it is hatched separately rather than presented as uncontested U.S. land.',
    dates: [['Convention signed', '1818-10-20']],
    sourceIds: ['convention'],
    match: ['Missouri Territory', 'Oregon Country'],
  },
  {
    id: 'adams-onis-treaty',
    date: '1819-02-22',
    title: 'Florida, and a transcontinental line',
    short: 'Florida treaty',
    kind: 'Treaty signed',
    region: 'Florida and the western boundary',
    scale: 1.5,
    summary:
      'Spain agreed to cede Florida and settle the western limits of the Louisiana Purchase. Ratification and handover came later.',
    explanation:
      'The atlas introduces the cession at signature in 1819. Hatching identifies this pending treaty claim until ratification in 1821. Spain also renounced claims in the Pacific Northwest; the United States recognized Spanish sovereignty over Texas.',
    dates: [
      ['Treaty signed', '1819-02-22'],
      ['Ratifications exchanged', '1821-02-22'],
    ],
    sourceIds: ['florida', 'floridaRatification'],
    match: ['Florida Unorg. FT'],
    story: true,
  },
  {
    id: 'florida-statehood',
    date: '1845-03-03',
    title: 'Florida becomes a state',
    short: 'Florida statehood',
    kind: 'Statehood',
    region: 'Florida',
    scale: 1.8,
    summary:
      'Florida entered the Union as a state, more than two decades after Spain ceded the territory.',
    explanation:
      'Statehood changed Florida’s constitutional and administrative status. It was not a new international acquisition. The historical state outline is distinct from the optional dashed modern state reference.',
    dates: [['State admitted', '1845-03-03']],
    sourceIds: ['states'],
    match: ['Florida'],
  },
  {
    id: 'texas-annexation',
    date: '1845-12-29',
    title: 'Texas joins a divided Union',
    short: 'Texas annexation',
    kind: 'Annexation and statehood',
    region: 'Texas and its disputed claims',
    scale: 1.45,
    summary:
      'The United States admitted Texas as a state. Texas claimed lands far beyond its present borders, including areas disputed with Mexico.',
    explanation:
      'The entire Texas polygon is hatched as a claimed extent, not a map of actual control. Annexation intensified conflict with Mexico. The 1850 settlement later reduced Texas’s claims, so modern Texas must not be substituted for the 1845 outline.',
    dates: [['State admitted', '1845-12-29']],
    sourceIds: ['texas', 'atlas'],
    match: ['Texas'],
    story: true,
  },
  {
    id: 'oregon-treaty',
    date: '1846-06-15',
    title: 'Oregon is divided at the border',
    short: 'Oregon Treaty',
    kind: 'Treaty signed',
    region: 'The Pacific Northwest',
    scale: 1.45,
    summary:
      'A treaty with Britain divided the Oregon Country, extending the 49th-parallel boundary toward the Pacific.',
    explanation:
      'The atlas changes the outline at the treaty-signing date. The agreement reserved all of Vancouver Island to Britain. Ratifications were exchanged in July; an organized U.S. Oregon Territory was not established until 1848.',
    dates: [
      ['Treaty signed', '1846-06-15'],
      ['Ratifications exchanged', '1846-07-17'],
      ['Territory organized', '1848-08-14'],
    ],
    sourceIds: ['oregon', 'oregonTreaty'],
    match: ['Oregon Unorg. FT'],
    story: true,
  },
  {
    id: 'mexican-cession',
    date: '1848-07-04',
    title: 'War redraws the Southwest',
    short: 'Mexican Cession',
    kind: 'Treaty proclaimed',
    region: 'California and the Southwest',
    scale: 1.25,
    summary:
      'The Treaty of Guadalupe Hidalgo ended the U.S.–Mexican War. Mexico ceded a large northern region to the United States.',
    explanation:
      'The source atlas introduces this geometry on the U.S. proclamation date, July 4. The treaty was signed February 2 and ratifications were exchanged May 30. This is a dated atlas reconstruction, not a claim that transfer waited until July. The treaty also addressed citizenship and property rights.',
    dates: [
      ['Treaty signed', '1848-02-02'],
      ['Ratifications exchanged', '1848-05-30'],
      ['U.S. proclamation / map date', '1848-07-04'],
    ],
    sourceIds: ['mexico'],
    match: ['Mexican Cession'],
    story: true,
  },
  {
    id: 'california-statehood',
    date: '1850-09-09',
    title: 'California enters the Union',
    short: 'California statehood',
    kind: 'Statehood',
    region: 'California and the western territories',
    scale: 1.45,
    summary:
      'California became a state as Congress reorganized parts of the recently acquired West.',
    explanation:
      'The same date brought the creation of Utah and New Mexico territories. These were internal administrative changes, not a new acquisition from Mexico. Texas’s boundary settlement appears in the atlas in December 1850.',
    dates: [['State admitted', '1850-09-09']],
    sourceIds: ['states', 'atlas'],
    match: ['California', 'Utah Territory'],
  },
  {
    id: 'gadsden-purchase',
    date: '1854-06-30',
    title: 'A purchase along the southern border',
    short: 'Gadsden Purchase',
    kind: 'Treaty enters into force',
    region: 'Southern Arizona and New Mexico',
    scale: 1.7,
    summary:
      'A revised treaty with Mexico added land along the southern border, linked to plans for a railroad route.',
    explanation:
      'The original December 1853 proposal was reduced before approval. This site introduces the atlas’s final footprint on June 30, 1854, when ratifications were exchanged, rather than pretending it maps the earlier proposal. The source record’s December start is retained in regional details, alongside the adopted display date.',
    dates: [
      ['Original treaty signed', '1853-12-30'],
      ['Ratifications exchanged / map date', '1854-06-30'],
    ],
    sourceIds: ['gadsden', 'gadsdenTreaty'],
    match: ['Gadsden Purchase'],
    story: true,
  },
  {
    id: 'alaska-purchase',
    date: '1867-03-30',
    title: 'Alaska, across the continent',
    short: 'Alaska Purchase',
    kind: 'Treaty signed',
    region: 'Alaska inset',
    scale: 2.2,
    summary:
      'The United States signed a purchase treaty with Russia for Alaska. The formal transfer took place in October.',
    explanation:
      'The source atlas starts the Alaska Department outline at the treaty date. Hatching marks the period before transfer. This was a transaction between governments, not the origin of Indigenous presence or rights. The inset relocates and reduces Alaska to fit the page.',
    dates: [
      ['Treaty signed', '1867-03-30'],
      ['Formal transfer', '1867-10-18'],
    ],
    sourceIds: ['alaska'],
    match: ['Alaska Department'],
    story: true,
  },
  {
    id: 'hawaii-annexation',
    date: '1898-07-07',
    title: 'The annexation of Hawaiʻi',
    short: 'Hawaiʻi annexation',
    kind: 'U.S. resolution signed',
    region: 'Hawaiʻi inset',
    scale: 3,
    summary:
      'A U.S. joint resolution asserted annexation of Hawaiʻi. The formal transfer followed in August, amid Native Hawaiian opposition.',
    explanation:
      'The map follows the atlas’s resolution date and hatches the islands before the formal transfer. Annexation followed the overthrow of the Hawaiian Kingdom in 1893 and substantial opposition to annexation. The relocated inset is not Hawaiʻi’s actual position relative to the mainland.',
    dates: [
      ['Resolution signed', '1898-07-07'],
      ['Formal transfer', '1898-08-12'],
    ],
    sourceIds: ['hawaii', 'hawaiiTransfer'],
    match: ['Hawaii Annexation'],
    story: true,
  },
  {
    id: 'alaska-statehood',
    date: '1959-01-03',
    title: 'Alaska becomes the 49th state',
    short: 'Alaska statehood',
    kind: 'Statehood',
    region: 'Alaska inset',
    scale: 2.2,
    summary:
      'Alaska’s admission changed its status from a U.S. territory to a state. It did not mark the purchase of Alaska.',
    explanation:
      'The purchase treaty and transfer had taken place in 1867. Statehood appears as a change in the map’s jurisdiction category; the acquisition outline does not suddenly expand.',
    dates: [['State admitted', '1959-01-03']],
    sourceIds: ['alaska', 'states'],
    match: ['Alaska'],
  },
  {
    id: 'hawaii-statehood',
    date: '1959-08-21',
    title: 'Hawaiʻi becomes the 50th state',
    short: 'Hawaiʻi statehood',
    kind: 'Statehood',
    region: 'Hawaiʻi inset',
    scale: 3,
    summary:
      'A presidential proclamation admitted Hawaiʻi as the 50th state. The atlas’s story ends here.',
    explanation:
      'Statehood and annexation are separate events. This map covers jurisdictions within the present fifty-state footprint and selected historical claims. It omits other overseas possessions and does not represent all Indigenous, foreign or contested sovereignty.',
    dates: [['State admitted', '1959-08-21']],
    sourceIds: ['hawaiiState', 'hawaii'],
    match: ['Hawaii'],
    story: true,
  },
];
export const defaultEvent = 'treaty-of-paris';
export const scopeNote =
  'Reconstructed jurisdictions and claims, not actual control. Other overseas territories and Indigenous boundaries are not mapped.';
export const eventById = (id) => events.find((e) => e.id === id);
export const eventAt = (date) => events.filter((e) => e.date <= date).at(-1) || events[0];
