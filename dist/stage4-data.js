'use strict';
// Stable section/text IDs preserve progress when cards are added or reordered.
const stageFourSections=[
  {id:'a4-office',name:'Office',ukTitle:'офіс',raw:`workplace|робоче місце
department|відділ
colleague|колега
supervisor|керівник / керівниця
employee|працівник / працівниця
employer|роботодавець
client|клієнт / клієнтка
reception desk|стійка адміністратора
meeting room|переговорна кімната
workstation|робоча станція; обладнане робоче місце
filing cabinet|шафа для документів
printer|принтер
scanner|сканер
photocopier|копіювальний апарат
spreadsheet|електронна таблиця
report|звіт
proposal|пропозиція; проєкт пропозиції
contract|договір
invoice|рахунок на оплату
deadline|кінцевий термін
schedule|розклад; графік
appointment|домовлена зустріч
agenda|порядок денний
minutes|протокол зустрічі
presentation|презентація
workload|робоче навантаження
overtime|понаднормова робота
salary|заробітна плата
promotion|підвищення на посаді
work remotely|працювати віддалено`},
  {id:'a4-synonyms',name:'Synonyms',ukTitle:'синоніми',raw:`begin — commence|починати — розпочинати
end — finish|завершувати — закінчувати
help — assist|допомагати (assist — формальніше)
buy — purchase|купувати — придбавати
need — require|потребувати (require — формальніше)
choose — select|обирати — відбирати
get — obtain|отримувати — здобувати
keep — retain|зберігати — утримувати
allow — permit|дозволяти (permit — формальніше)
stop — halt|зупиняти — припиняти
ask — inquire|питати — довідуватися
tell — inform|повідомляти — інформувати
show — demonstrate|показувати — демонструвати
explain — clarify|пояснювати — роз’яснювати
answer — reply|відповідати — давати відповідь
try — attempt|намагатися — робити спробу
build — construct|будувати — споруджувати
change — alter|змінювати (alter — формальніше)
use — employ|використовувати — застосовувати
suggest — propose|пропонувати — висувати пропозицію
important — significant|важливий — значущий
difficult — challenging|складний — непростий; такий, що потребує зусиль
quick — rapid|швидкий — стрімкий
quiet — silent|тихий — беззвучний
angry — furious|сердитий — розлючений (furious — сильніше)
brave — courageous|сміливий — мужній
clever — intelligent|кмітливий — розумний
strange — unusual|дивний — незвичайний
enough — sufficient|достатній (sufficient — формальніше)
wrong — incorrect|неправильний — помилковий`},
  {id:'a4-materials',name:'Materials and Fabrics',ukTitle:'матеріали та тканини',raw:`material|матеріал
fabric|тканина
cotton|бавовна
wool|вовна
silk|шовк
linen|льон; лляна тканина
denim|джинсова тканина
velvet|оксамит
leather|шкіра (матеріал)
suede|замша
polyester|поліестер
nylon|нейлон
fleece|фліс
lace|мереживо
thread|нитка
fibre|волокно
wood|деревина
metal|метал
steel|сталь
copper|мідь
aluminium|алюміній
glass|скло
plastic|пластик
rubber|гума
concrete|бетон
brick|цегла
ceramic|кераміка; керамічний
waterproof|водонепроникний
breathable|такий, що пропускає повітря (про тканину)
durable|довговічний; зносостійкий`},
  {id:'a4-dreams',name:'Dreams and Wishes',ukTitle:'мрії та бажання',raw:`dream|мрія; мріяти
wish|бажання; бажати
hope|надія; сподіватися
ambition|прагнення до успіху; амбіція
aspiration|сильне прагнення
desire|бажання; прагнути
goal|мета
aim|ціль; прагнути
purpose|мета; призначення
intention|намір
expectation|очікування
possibility|можливість
opportunity|нагода; можливість
motivation|мотивація
inspiration|натхнення
determination|рішучість
imagination|уява
daydream|мрія наяву; мріяти наяву
nightmare|кошмарний сон
dream come true|мрія, що здійснилася
fulfil a dream|здійснити мрію
make a wish|загадати бажання
set a goal|поставити мету
achieve a goal|досягти мети
pursue an ambition|прагнути здійснити свої амбіції
long for|дуже хотіти; тужити за
look forward to|з нетерпінням чекати на
hope for the best|сподіватися на краще
If only I could|якби ж я міг / могла
I wish I had more time|шкода, що в мене немає більше часу`},
  {id:'a4-rules',name:'Rules and Prohibitions',ukTitle:'правила та заборони',raw:`rule|правило
regulation|норма; правило, встановлене офіційно
law|закон
policy|політика; встановлені правила
requirement|вимога
restriction|обмеження
prohibition|заборона
permission|дозвіл
obligation|обов’язок; зобов’язання
responsibility|відповідальність
compulsory|обов’язковий
optional|необов’язковий; на вибір
allowed|дозволений
forbidden|заборонений
legal|законний
illegal|незаконний
ban|заборона; забороняти
permit|дозволяти; офіційний дозвіл
forbid|забороняти
enforce|забезпечувати дотримання (правил або закону)
obey|слухатися; дотримуватися
comply with|дотримуватися (вимог або правил)
break a rule|порушити правило
follow instructions|виконувати вказівки
fine|штраф
penalty|покарання; штрафна санкція
warning|попередження
exception|виняток
No entry|вхід заборонено
You are not allowed to|вам не дозволено`},
  {id:'a4-geography',name:'Geography',ukTitle:'географія',raw:`continent|континент
region|регіон; область
territory|територія
border|кордон
coast|узбережжя
coastline|берегова лінія
peninsula|півострів
island|острів
archipelago|архіпелаг
mainland|материк; основна частина суші
equator|екватор
hemisphere|півкуля
latitude|географічна широта
longitude|географічна довгота
tropics|тропіки
climate|клімат
terrain|місцевість; рельєф
landscape|ландшафт; краєвид
plain|рівнина
plateau|плато
valley|долина
desert|пустеля
glacier|льодовик
volcano|вулкан
canyon|каньйон
waterfall|водоспад
altitude|висота над рівнем моря
sea level|рівень моря
population|населення
capital city|столиця`},
  {id:'a4-environment',name:'Environment',ukTitle:'довкілля',raw:`environment|довкілля
ecology|екологія
ecosystem|екосистема
biodiversity|біорізноманіття
habitat|середовище існування
conservation|охорона природи; збереження
pollution|забруднення
emissions|викиди
greenhouse gas|парниковий газ
carbon footprint|вуглецевий слід
climate change|зміна клімату
global warming|глобальне потепління
renewable energy|відновлювана енергія
fossil fuel|викопне паливо
drought|посуха
flood|повінь
deforestation|вирубування лісів
extinction|вимирання
endangered species|види під загрозою зникнення
wildlife|дикі тварини та рослини
natural resources|природні ресурси
sustainability|сталість; використання ресурсів без їх виснаження
recycle|переробляти для повторного використання
reuse|використовувати повторно
reduce waste|зменшувати кількість відходів
landfill|сміттєзвалище
compost|компост; компостувати
biodegradable|біорозкладний
solar energy|сонячна енергія
wind power|вітрова енергія`},
  {id:'a4-rural-life',name:'Rural Life',ukTitle:'життя в селі',raw:`countryside|сільська місцевість
village|село
hamlet|невелике село; хутір
rural community|сільська громада
resident|мешканець / мешканка
cottage|невеликий заміський будинок
farmhouse|фермерський будинок
barn|комора; господарська будівля на фермі
pasture|пасовище
meadow|лука
lane|вузька дорога; провулок
footpath|пішохідна стежка
fence|паркан
hedge|живопліт
well|колодязь
firewood|дрова
fireplace|камін
harvest|урожай; збирання врожаю
agriculture|сільське господарство
livestock|сільськогосподарські тварини; худоба
poultry|свійська птиця
tradition|традиція
peaceful|спокійний; мирний
remote|віддалений
isolated|відокремлений; ізольований
self-sufficient|самодостатній; здатний забезпечувати себе
local produce|місцеві сільськогосподарські продукти
village fair|сільський ярмарок
live off the land|жити з того, що дає земля
move to the countryside|переїхати в сільську місцевість`},
  {id:'a4-farm',name:'Farm and Garden',ukTitle:'ферма та сад',raw:`farm|ферма
garden|сад; город
soil|ґрунт
seed|насінина; насіння
seedling|сіянець; молодий саджанець
root|корінь
stem|стебло
leaf|листок
fertilizer|добриво
compost|компост
irrigation|зрошення
greenhouse|теплиця
orchard|фруктовий сад
vegetable patch|грядка для овочів; город
crop|сільськогосподарська культура; урожай
wheat|пшениця
corn|кукурудза
barley|ячмінь
oats|овес
tractor|трактор
plough|плуг; орати
rake|граблі
hoe|сапа
shovel|лопата
watering can|лійка для поливання
plant|рослина; садити
water|поливати
weed|бур’ян; прополювати
prune|обрізати гілки
harvest|збирати врожай; урожай`},
  {id:'a4-sea',name:'Sea and Beach',ukTitle:'море та пляж',raw:`sea|море
ocean|океан
shore|берег
coast|узбережжя
beach|пляж
bay|затока
cove|невелика бухта
harbour|гавань
pier|пірс; причал
reef|риф
coral|корал
tide|приплив і відплив
current|течія
wave|хвиля
surf|прибій
sand|пісок
pebble|камінчик; галька
shell|мушля
seaweed|морські водорості
jellyfish|медуза
seagull|мартин; чайка
lifeguard|рятувальник / рятувальниця на воді
buoy|буй
anchor|якір
sailboat|вітрильник
sunscreen|сонцезахисний крем
parasol|парасоля від сонця
sunbathe|засмагати
swim|плавати
ashore|на берег; на березі`},
  {id:'a4-mountains',name:'Mountains and Forests',ukTitle:'гори та ліси',raw:`mountain|гора
summit|вершина гори
peak|пік; гірська вершина
ridge|гірський хребет; гребінь
slope|схил
cliff|урвище; прямовисна скеля
rock|скеля; камінь
boulder|валун
foothills|передгір’я
mountain range|гірський масив; гірське пасмо
mountain pass|гірський перевал
trail|стежка; туристичний маршрут
hiking|піші походи
backpack|рюкзак
shelter|укриття; прихисток
forest|ліс
woodland|лісиста місцевість
clearing|галявина
undergrowth|підлісок
moss|мох
fern|папороть
bark|кора дерева
trunk|стовбур
branch|гілка
evergreen|вічнозелений
deciduous|листопадний (про дерева)
pine|сосна
oak|дуб
nature reserve|природний заповідник
breathtaking view|краєвид, від якого перехоплює подих`},
  {id:'a4-space',name:'Space',ukTitle:'космос',raw:`universe|всесвіт
galaxy|галактика
solar system|сонячна система
star|зоря; зірка
planet|планета
satellite|супутник
moon|місяць; природний супутник планети
asteroid|астероїд
comet|комета
meteorite|метеорит
orbit|орбіта; обертатися по орбіті
gravity|сила тяжіння; гравітація
atmosphere|атмосфера
vacuum|вакуум
light year|світловий рік
constellation|сузір’я
nebula|туманність
eclipse|затемнення
spacecraft|космічний апарат
rocket|ракета
space shuttle|космічний шатл
space station|космічна станція
astronaut|астронавт / астронавтка
mission|місія; космічна експедиція
launch|запуск; запускати
landing|посадка
exploration|дослідження незвіданого
telescope|телескоп
black hole|чорна діра
Milky Way|Чумацький Шлях`},
  {id:'a4-sensations',name:'Feelings and Sensations',ukTitle:'почуття та відчуття',raw:`feeling|почуття; відчуття
sensation|відчуття; враження
senses|органи чуття; чуття
sight|зір
hearing|слух
smell|нюх; запах
taste|смак
touch|дотик; доторкатися
warmth|тепло
chill|відчуття холоду; озноб
shiver|тремтіти; тремтіння
numbness|оніміння
tingling|поколювання
dizziness|запаморочення
nausea|нудота
fatigue|втома; виснаження
relief|полегшення
discomfort|дискомфорт; незручність
tension|напруження
pressure|тиск
sensitivity|чутливість
irritation|подразнення; роздратування
itch|свербіж; свербіти
ache|ниючий біль; нити
throbbing pain|пульсуючий біль
burning sensation|відчуття печіння
goosebumps|гусяча шкіра; мурашки по шкірі
out of breath|захеканий / захекана
feel overwhelmed|відчувати, що не справляєшся з напливом справ або почуттів
relaxed|розслаблений / розслаблена`},
  {id:'a4-thoughts',name:'Thoughts and Beliefs',ukTitle:'думки та переконання',raw:`thought|думка
idea|ідея
opinion|думка; погляд
belief|переконання; віра
assumption|припущення
expectation|очікування
doubt|сумнів; сумніватися
certainty|упевненість; певність
evidence|докази; свідчення
fact|факт
theory|теорія
hypothesis|гіпотеза
reasoning|міркування; хід думок
logic|логіка
judgement|судження; оцінка
perspective|точка зору
viewpoint|погляд; позиція
bias|упередженість
prejudice|упередження
attitude|ставлення
value|цінність; цінувати
principle|принцип
conviction|тверде переконання
faith|віра
trust|довіра; довіряти
agree|погоджуватися
disagree|не погоджуватися
reconsider|переглянути свою думку або рішення
take into account|брати до уваги
make up your mind|прийняти рішення; визначитися`},
  {id:'a4-success',name:'Successes and Failures',ukTitle:'успіхи та невдачі',raw:`success|успіх
achievement|досягнення
accomplishment|успішно виконана справа; досягнення
progress|поступ; прогрес
improvement|покращення
breakthrough|прорив; значний поступ
milestone|важливий етап
victory|перемога
triumph|тріумф
reward|винагорода
recognition|визнання
reputation|репутація
effort|зусилля
persistence|наполегливість
resilience|стійкість; здатність відновлюватися після труднощів
determination|рішучість
challenge|виклик; складне завдання
obstacle|перешкода
setback|невдача, що затримує поступ
failure|невдача; провал
mistake|помилка
defeat|поразка
disappointment|розчарування
regret|жаль; шкодувати
learn from mistakes|вчитися на помилках
overcome difficulties|долати труднощі
succeed|досягати успіху
fail|зазнавати невдачі
bounce back|оговтатися після невдачі
pay off|окупитися; дати результат (про зусилля)`}
];
for(const [index,section] of stageFourSections.entries()){
  categories.push({id:section.id,name:section.name,en:section.name,ukTitle:section.ukTitle,stage:4,color:'olive',note:section.ukTitle,tile:['0% 0%','66.66% 14.28%','33.33% 0%','0% 42.85%'][index%4]});
  for(const line of section.raw.split('\n').filter(line=>line.trim())){
    const [en,uk]=line.split('|');
    words.push({id:section.id+'-'+encodeURIComponent(en.toLowerCase()),en,uk,category:section.id});
  }
}
