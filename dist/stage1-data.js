'use strict';
// IDs are based on the section and English text so adding or reordering cards preserves progress.
const stageOneSections=[
  {id:'a1-greetings',name:'Introductions and Greetings',ukTitle:'знайомство та привітання',raw:`hello|привіт
hi|привіт
good morning|доброго ранку
good afternoon|добрий день
good evening|добрий вечір
welcome|ласкаво просимо
nice to meet you|приємно познайомитися
how are you?|як справи?
I'm fine|у мене все добре
my name is|мене звати
what's your name?|як тебе звати?
I'm from Ukraine|я з України
where are you from?|звідки ти?
how old are you?|скільки тобі років?
I'm twenty years old|мені двадцять років
this is my friend|це мій друг
first name|ім'я
last name|прізвище`},
  {id:'a1-goodbye',name:'Saying Goodbye and Thank You',ukTitle:'прощання та подяка',raw:`goodbye|до побачення
bye|бувай
see you|до зустрічі
see you later|побачимося пізніше
see you tomorrow|до завтра
good night|на добраніч
have a nice day|гарного дня
have a good weekend|гарних вихідних
take care|бережи себе
thank you|дякую
thanks|дякую
thank you very much|дуже дякую
thanks for your help|дякую за допомогу
you're welcome|будь ласка (відповідь на подяку)
no problem|без проблем
please|будь ласка (прохання)
sorry|вибач
excuse me|перепрошую`},
  {id:'a1-phrases',name:'Common Phrases',ukTitle:'поширені фрази',raw:`yes|так
no|ні
OK|добре; гаразд
of course|звичайно
I don't know|я не знаю
I understand|я розумію
I don't understand|я не розумію
please speak slowly|говоріть повільніше, будь ласка
can you repeat that?|можете повторити це?
what does it mean?|що це означає?
how do you spell it?|як це пишеться по літерах?
I need help|мені потрібна допомога
can you help me?|можете мені допомогти?
how much is it?|скільки це коштує?
where is the toilet?|де туалет?
I'd like some water|я хотів би / хотіла б води
I'm hungry|я голодний / голодна
I'm thirsty|я хочу пити
I like it|мені це подобається
that's right|це правильно`},
  {id:'a1-pronouns',name:'Pronouns',ukTitle:'займенники',raw:`I|я
you|ти; ви
he|він
she|вона
it|воно; це (про річ або тварину)
we|ми
they|вони
me|мене; мені
him|його; йому
her|її; їй
us|нас; нам
them|їх; їм
my|мій; моя; моє
your|твій; ваш
his|його (належність)
its|його; її (належність речі або тварині)
our|наш
their|їхній
mine|мій; моя (без іменника)
yours|твій; ваш (без іменника)
ours|наш; наша (без іменника)
hers|її (без іменника)
theirs|їхній; їхня (без іменника)
this|це; цей
that|те; той
these|ці
those|ті`},
  {id:'a1-questions',name:'Question Words',ukTitle:'питальні слова',raw:`what|що; який
who|хто
where|де; куди
when|коли
why|чому
how|як
which|котрий; який із
whose|чий
how many|скільки (злічуваних предметів)
how much|скільки (незлічувана кількість або ціна)
how old|скільки років
what time|о котрій годині`},
  {id:'a1-numbers',name:'Numbers',ukTitle:'числа',raw:`zero|нуль
one|один
two|два
three|три
four|чотири
five|п'ять
six|шість
seven|сім
eight|вісім
nine|дев'ять
ten|десять
eleven|одинадцять
twelve|дванадцять
thirteen|тринадцять
fourteen|чотирнадцять
fifteen|п'ятнадцять
sixteen|шістнадцять
seventeen|сімнадцять
eighteen|вісімнадцять
nineteen|дев'ятнадцять
twenty|двадцять
thirty|тридцять
forty|сорок
fifty|п'ятдесят
sixty|шістдесят
seventy|сімдесят
eighty|вісімдесят
ninety|дев'яносто
one hundred|сто
one thousand|тисяча
first|перший
second|другий
third|третій
fourth|четвертий
fifth|п'ятий
sixth|шостий
seventh|сьомий
eighth|восьмий
ninth|дев'ятий
tenth|десятий`},
  {id:'a1-colors',name:'Colors',ukTitle:'кольори',raw:`red|червоний
orange|помаранчевий
yellow|жовтий
green|зелений
blue|синій
light blue|блакитний
dark blue|темно-синій
purple|фіолетовий
pink|рожевий
brown|коричневий
black|чорний
white|білий
grey|сірий
gold|золотий (колір)
silver|срібний (колір)`},
  {id:'a1-days',name:'Days of the Week',ukTitle:'дні тижня',raw:`Monday|понеділок
Tuesday|вівторок
Wednesday|середа
Thursday|четвер
Friday|п'ятниця
Saturday|субота
Sunday|неділя
day|день
week|тиждень
weekday|будній день
weekend|вихідні`},
  {id:'a1-months',name:'Months and Seasons',ukTitle:'місяці та пори року',raw:`January|січень
February|лютий
March|березень
April|квітень
May|травень
June|червень
July|липень
August|серпень
September|вересень
October|жовтень
November|листопад
December|грудень
spring|весна
summer|літо
autumn|осінь
winter|зима
month|місяць
season|пора року`},
  {id:'a1-time',name:'Time',ukTitle:'час',raw:`time|час
clock|годинник (настінний або настільний)
watch|наручний годинник
hour|година
minute|хвилина
second|секунда
morning|ранок
afternoon|час після полудня
evening|вечір
night|ніч
noon|полудень
midnight|північ (час)
today|сьогодні
tomorrow|завтра
yesterday|вчора
now|зараз
later|пізніше
early|рано
late|пізно
o'clock|година (при називанні часу)
half past two|пів на третю
a quarter past two|чверть на третю
a quarter to three|за чверть третя
year|рік`},
  {id:'a1-family',name:'Family and Relatives',ukTitle:'сім’я та родичі',raw:`family|сім'я
mother|мати
father|батько
mum|мама
dad|тато
parent|один із батьків
parents|батьки
sister|сестра
brother|брат
daughter|донька
son|син
child|дитина
children|діти
baby|немовля
grandmother|бабуся
grandfather|дідусь
grandparents|бабуся й дідусь
aunt|тітка
uncle|дядько
cousin|двоюрідний брат / двоюрідна сестра
husband|чоловік (у шлюбі)
wife|дружина
relative|родич / родичка`},
  {id:'a1-countries',name:'Countries and Nationalities',ukTitle:'країни та національності',raw:`country|країна
nationality|національність
Ukraine|Україна
Ukrainian|українець / українка; український
Poland|Польща
Polish|поляк / полька; польський
Germany|Німеччина
German|німець / німкеня; німецький
France|Франція
French|француз / француженка; французький
Italy|Італія
Italian|італієць / італійка; італійський
Spain|Іспанія
Spanish|іспанець / іспанка; іспанський
the United Kingdom|Сполучене Королівство
British|британець / британка; британський
England|Англія
English|англієць / англійка; англійський
the United States|Сполучені Штати
American|американець / американка; американський
Canada|Канада
Canadian|канадець / канадійка; канадський
Australia|Австралія
Australian|австралієць / австралійка; австралійський
China|Китай
Chinese|китаєць / китаянка; китайський
Japan|Японія
Japanese|японець / японка; японський
Turkey|Туреччина
Turkish|турок / туркеня; турецький
Brazil|Бразилія
Brazilian|бразилець / бразилійка; бразильський`},
  {id:'a1-appearance',name:'People and Appearance',ukTitle:'люди та зовнішність',raw:`person|людина
people|люди
man|чоловік
woman|жінка
boy|хлопчик
girl|дівчинка
adult|доросла людина
friend|друг / подруга
hair|волосся
face|обличчя
eye|око
eyes|очі
nose|ніс
mouth|рот
ear|вухо
ears|вуха
beard|борода
glasses|окуляри
tall|високий (про людину)
short|невисокий (про людину)
young|молодий
old|старий; літній
long hair|довге волосся
short hair|коротке волосся
blonde hair|світле волосся
dark hair|темне волосся`},
  {id:'a1-verbs',name:'Basic Verbs',ukTitle:'основні дієслова',raw:`be|бути
have|мати
do|робити
go|іти; їхати
come|приходити
get|отримувати
make|робити; виготовляти
take|брати
give|давати
want|хотіти
need|потребувати
like|подобатися; любити
love|любити; кохати
know|знати
think|думати
understand|розуміти
see|бачити
look|дивитися
hear|чути
listen|слухати
say|сказати
speak|говорити
ask|запитувати
answer|відповідати
read|читати
write|писати
learn|вивчати; навчатися
work|працювати
live|жити
eat|їсти
drink|пити
sleep|спати
open|відчиняти; відкривати
close|зачиняти; закривати
buy|купувати
pay|платити
help|допомагати
wait|чекати
find|знаходити
use|використовувати`},
  {id:'a1-activities',name:'Daily Activities',ukTitle:'щоденні справи',raw:`go to work|іти на роботу
go to school|іти до школи
study|навчатися
do homework|робити домашнє завдання
have lunch|обідати
go home|іти додому
cook|готувати їжу
clean the house|прибирати вдома
wash the dishes|мити посуд
do the laundry|прати
go shopping|ходити за покупками
walk|ходити пішки
take the bus|їхати автобусом
drive|керувати автомобілем
meet friends|зустрічатися з друзями
watch TV|дивитися телевізор
listen to music|слухати музику
read a book|читати книжку
play a game|грати в гру
exercise|займатися фізичними вправами
rest|відпочивати
call a friend|телефонувати другові / подрузі`},
  {id:'a1-routines',name:'Morning and Evening Routines',ukTitle:'ранкові та вечірні звички',raw:`wake up|прокидатися
get up|вставати з ліжка
make the bed|застеляти ліжко
wash my face|умиватися
brush my teeth|чистити зуби
take a shower|приймати душ
get dressed|одягатися
brush my hair|розчісувати волосся
have breakfast|снідати
drink coffee|пити каву
leave home|виходити з дому
come home|приходити додому
have dinner|вечеряти
take a bath|приймати ванну
change clothes|переодягатися
put on pyjamas|одягати піжаму
set the alarm|заводити будильник
turn off the light|вимикати світло
go to bed|лягати спати
fall asleep|засинати`},
  {id:'a1-home',name:'House and Apartment',ukTitle:'будинок та квартира',raw:`house|будинок
apartment|квартира
flat|квартира (британський варіант)
home|дім; домівка
building|будівля
address|адреса
street|вулиця
floor|поверх; підлога
wall|стіна
roof|дах
ceiling|стеля
door|двері
window|вікно
stairs|сходи
lift|ліфт
key|ключ
garden|сад
balcony|балкон
garage|гараж
neighbour|сусід / сусідка
rent|орендувати
live here|жити тут`},
  {id:'a1-rooms',name:'Rooms',ukTitle:'кімнати',raw:`room|кімната
bedroom|спальня
living room|вітальня
kitchen|кухня
bathroom|ванна кімната
dining room|їдальня
hall|передпокій
study|кабінет (кімната)
toilet|туалет
basement|підвал
attic|горище
guest room|гостьова кімната`},
  {id:'a1-furniture',name:'Furniture',ukTitle:'меблі',raw:`furniture|меблі
table|стіл
chair|стілець
sofa|диван
armchair|крісло
bed|ліжко
wardrobe|шафа для одягу
cupboard|шафа для посуду або речей
desk|письмовий стіл
shelf|полиця
bookcase|книжкова шафа
drawer|шухляда
mirror|дзеркало
lamp|лампа
carpet|килим
curtain|штора
pillow|подушка
blanket|ковдра
mattress|матрац
bedside table|тумбочка біля ліжка`},
  {id:'a1-food',name:'Food and Groceries',ukTitle:'їжа та продукти',raw:`food|їжа
groceries|продукти харчування
bread|хліб
butter|вершкове масло
cheese|сир
milk|молоко
egg|яйце
meat|м'ясо
chicken|курятина
beef|яловичина
pork|свинина
fish|риба
rice|рис
pasta|макаронні вироби
flour|борошно
sugar|цукор
salt|сіль
oil|олія
soup|суп
salad|салат
sandwich|бутерброд; сендвіч
porridge|каша
yoghurt|йогурт
jam|варення
honey|мед
biscuit|печиво
cake|торт; кекс
chocolate|шоколад
breakfast|сніданок
lunch|обід
dinner|вечеря; головний прийом їжі`},
  {id:'a1-drinks',name:'Drinks and Beverages',ukTitle:'напої',raw:`drink|напій
water|вода
tea|чай
coffee|кава
milk|молоко
juice|сік
orange juice|апельсиновий сік
apple juice|яблучний сік
lemonade|лимонад
hot chocolate|гарячий шоколад
mineral water|мінеральна вода
still water|негазована вода
sparkling water|газована вода
black tea|чорний чай
green tea|зелений чай
a cup of tea|чашка чаю
a glass of water|склянка води
a bottle of water|пляшка води`},
  {id:'a1-fruit',name:'Fruits and Berries',ukTitle:'фрукти та ягоди',raw:`fruit|фрукти; плід
berry|ягода
apple|яблуко
pear|груша
banana|банан
orange|апельсин
lemon|лимон
lime|лайм
grape|виноградина
grapes|виноград
peach|персик
apricot|абрикос
plum|слива
cherry|вишня; черешня
strawberry|полуниця
raspberry|малина
blueberry|лохина
blackberry|ожина
watermelon|кавун
melon|диня
pineapple|ананас
kiwi|ківі`},
  {id:'a1-vegetables',name:'Vegetables',ukTitle:'овочі',raw:`vegetable|овоч
potato|картоплина; картопля
tomato|помідор
cucumber|огірок
carrot|морква
onion|цибуля
garlic|часник
cabbage|капуста
lettuce|салат (листя)
pepper|перець
bell pepper|солодкий перець
peas|горох
beans|квасоля
corn|кукурудза
broccoli|броколі
cauliflower|цвітна капуста
spinach|шпинат
beetroot|буряк
pumpkin|гарбуз
aubergine|баклажан
courgette|кабачок`},
  {id:'a1-clothes',name:'Clothes and Accessories',ukTitle:'одяг та аксесуари',raw:`clothes|одяг
shirt|сорочка
T-shirt|футболка
blouse|блузка
sweater|светр
hoodie|худі
jacket|куртка; жакет
coat|пальто
trousers|штани
jeans|джинси
shorts|шорти
skirt|спідниця
dress|сукня
suit|костюм
socks|шкарпетки
tights|колготки
underwear|спідня білизна
pyjamas|піжама
hat|капелюх; шапка
cap|кепка
scarf|шарф
gloves|рукавички
belt|ремінь
bag|сумка
handbag|дамська сумка
backpack|рюкзак`},
  {id:'a1-shoes',name:'Shoes and Footwear',ukTitle:'взуття',raw:`shoe|туфля; черевик
shoes|взуття; туфлі
boots|чоботи; черевики
trainers|кросівки (британський варіант)
sneakers|кросівки (американський варіант)
sandals|сандалі
slippers|капці
flip-flops|в'єтнамки
high heels|взуття на високих підборах
shoelace|шнурок для взуття
a pair of shoes|пара взуття
shoe size|розмір взуття`},
  {id:'a1-weather',name:'Weather',ukTitle:'погода',raw:`weather|погода
sun|сонце
sunny|сонячний
rain|дощ
rainy|дощовий
snow|сніг
snowy|сніжний
wind|вітер
windy|вітряний
cloud|хмара
cloudy|хмарний
fog|туман
foggy|туманний
hot|спекотний; гарячий
warm|теплий
cool|прохолодний
cold|холодний
wet|мокрий; вологий
dry|сухий
storm|буря; шторм
temperature|температура
it's raining|іде дощ
it's snowing|іде сніг`},
  {id:'a1-adjectives',name:'Adjectives',ukTitle:'прикметники',raw:`good|хороший; добрий
bad|поганий
happy|щасливий
sad|сумний
tired|втомлений
hungry|голодний
thirsty|спраглий
busy|зайнятий
free|вільний; безкоштовний
easy|легкий (нескладний)
difficult|складний
interesting|цікавий
boring|нудний
beautiful|гарний; красивий
nice|приємний; гарний
friendly|привітний; дружній
kind|добрий; люб'язний
funny|смішний
important|важливий
ready|готовий
clean|чистий
dirty|брудний
new|новий
old|старий
cheap|дешевий
expensive|дорогий (за ціною)
fast|швидкий
slow|повільний
quiet|тихий
loud|гучний
full|повний
empty|порожній`},
  {id:'a1-shapes',name:'Shapes and Sizes',ukTitle:'форми та розміри',raw:`shape|форма
size|розмір
circle|коло
square|квадрат
triangle|трикутник
rectangle|прямокутник
oval|овал
round|круглий
square-shaped|квадратної форми
big|великий
small|маленький
large|великий
long|довгий
short|короткий
wide|широкий
narrow|вузький
high|високий
low|низький
thick|товстий (про товщину)
thin|тонкий (про товщину)`},
  {id:'a1-opposites',name:'Opposites (Antonyms)',ukTitle:'протилежності (антоніми)',raw:`big — small|великий — маленький
good — bad|хороший — поганий
hot — cold|гарячий — холодний
new — old|новий — старий
young — old|молодий — старий
happy — sad|щасливий — сумний
fast — slow|швидкий — повільний
long — short|довгий — короткий
tall — short|високий — невисокий (про зріст)
high — low|високий — низький
clean — dirty|чистий — брудний
easy — difficult|легкий — складний
cheap — expensive|дешевий — дорогий
full — empty|повний — порожній
open — closed|відчинений — зачинений
light — dark|світлий — темний
day — night|день — ніч
early — late|рано — пізно
wet — dry|мокрий — сухий
in — out|всередині — зовні
up — down|угору — униз
near — far|близько — далеко
left — right|ліворуч — праворуч
quiet — loud|тихий — гучний`}
];
for(const [index,section] of stageOneSections.entries()){
  categories.push({id:section.id,name:section.name,en:section.name,ukTitle:section.ukTitle,stage:1,color:'olive',note:section.ukTitle,tile:['0% 0%','66.66% 14.28%','33.33% 0%','0% 42.85%'][index%4]});
  for(const line of section.raw.split('\n')){
    const [en,uk]=line.split('|');
    words.push({id:section.id+'-'+encodeURIComponent(en.toLowerCase()),en,uk,category:section.id});
  }
}
