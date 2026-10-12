'use strict';
// Reviewed examples use {word} as an explicit gap, never a guessed substring.
const lessonExamples = new Map(`
apple|I eat an {word}.|Я їм яблуко.|🍎
banana|I eat a {word}.|Я їм банан.|🍌
bread|I eat {word}.|Я їм хліб.|🍞
milk|I drink {word}.|Я п’ю молоко.|🥛
water|I drink {word}.|Я п’ю воду.|💧
tea|I drink {word}.|Я п’ю чай.|🍵
coffee|I drink {word}.|Я п’ю каву.|☕
rice|I cook {word}.|Я готую рис.
cheese|I like {word}.|Мені подобається сир.|🧀
egg|I eat an {word}.|Я їм яйце.|🥚
orange|I eat an {word}.|Я їм апельсин.|🍊
potato|I cook a {word}.|Я готую картоплину.|🥔
tomato|I eat a {word}.|Я їм помідор.|🍅
carrot|I eat a {word}.|Я їм морквину.|🥕
strawberry|I eat a {word}.|Я їм полуницю.|🍓
lemon|I need a {word}.|Мені потрібен лимон.|🍋
salt|I need some {word}.|Мені потрібно трохи солі.
sugar|I need some {word}.|Мені потрібно трохи цукру.
food|I buy {word}.|Я купую їжу.
breakfast|I make {word}.|Я готую сніданок.
lunch|I make {word}.|Я готую обід.
dinner|I make {word}.|Я готую вечерю.
book|I read a {word}.|Я читаю книжку.|📖
pen|I have a {word}.|У мене є ручка.|🖊️
pencil|I have a {word}.|У мене є олівець.|✏️
bag|I have a {word}.|У мене є сумка.
phone|I have a {word}.|У мене є телефон.|📱
computer|I use a {word}.|Я користуюся комп’ютером.|💻
table|I see a {word}.|Я бачу стіл.
chair|I need a {word}.|Мені потрібен стілець.
door|I open the {word}.|Я відчиняю двері.|🚪
window|I open the {word}.|Я відчиняю вікно.
bed|I need a {word}.|Мені потрібне ліжко.
room|I clean my {word}.|Я прибираю свою кімнату.
house|I see a {word}.|Я бачу будинок.|🏠
home|I go {word}.|Я йду додому.
school|I go to {word}.|Я ходжу до школи.
car|I have a {word}.|У мене є автомобіль.|🚗
bus|I see a {word}.|Я бачу автобус.|🚌
train|I see a {word}.|Я бачу потяг.|🚆
ticket|I need a {word}.|Мені потрібен квиток.
passport|I have my {word}.|У мене є мій паспорт.
airport|I am at the {word}.|Я в аеропорту.
hotel|I am at the {word}.|Я в готелі.
city|I like this {word}.|Мені подобається це місто.
country|I like this {word}.|Мені подобається ця країна.
family|I love my {word}.|Я люблю свою родину.
friend|I meet my {word}.|Я зустрічаю свого друга.
mother|I help my {word}.|Я допомагаю своїй мамі.
father|I help my {word}.|Я допомагаю своєму татові.
sister|I help my {word}.|Я допомагаю своїй сестрі.
brother|I help my {word}.|Я допомагаю своєму братові.
child|I see a {word}.|Я бачу дитину.
dog|I see a {word}.|Я бачу собаку.|🐕
cat|I see a {word}.|Я бачу кота.|🐈
bird|I see a {word}.|Я бачу птаха.|🐦
tree|I see a {word}.|Я бачу дерево.|🌳
flower|I see a {word}.|Я бачу квітку.|🌷
sun|I see the {word}.|Я бачу сонце.|☀️
moon|I see the {word}.|Я бачу місяць.|🌙
sea|I like the {word}.|Мені подобається море.|🌊
mountain|I see a {word}.|Я бачу гору.|⛰️
garden|I have a {word}.|У мене є сад.
money|I need {word}.|Мені потрібні гроші.
time|I need more {word}.|Мені потрібно більше часу.
help|I need {word}.|Мені потрібна допомога.
question|I have a {word}.|У мене є запитання.
problem|I have a {word}.|У мене є проблема.
idea|I have an {word}.|У мене є ідея.
information|I need more {word}.|Мені потрібно більше інформації.
music|I like {word}.|Мені подобається музика.|🎵
workstation|I use this {word}.|Я користуюся цим робочим місцем.
office|I am in the {word}.|Я в офісі.
meeting|I have a {word}.|У мене є зустріч.
cotton|This shirt is made of {word}.|Ця сорочка зроблена з бавовни.
silk|This scarf is made of {word}.|Цей шарф зроблений із шовку.
dream|I have a {word}.|У мене є мрія.
rule|I know this {word}.|Я знаю це правило.
forest|I see a {word}.|Я бачу ліс.
planet|I see a {word}.|Я бачу планету.
success|I wish you {word}.|Я бажаю тобі успіху.
good|This book is {word}.|Ця книжка хороша.
bad|This idea is {word}.|Ця ідея погана.
new|This book is {word}.|Ця книжка нова.
old|This house is {word}.|Цей будинок старий.
big|This house is {word}.|Цей будинок великий.
small|This room is {word}.|Ця кімната маленька.
red|This apple is {word}.|Це яблуко червоне.
green|This apple is {word}.|Це яблуко зелене.
blue|This bag is {word}.|Ця сумка синя.
black|This bag is {word}.|Ця сумка чорна.
white|This shirt is {word}.|Ця сорочка біла.
yellow|This flower is {word}.|Ця квітка жовта.
happy|I am {word}.|Я щаслива.
sad|I am {word}.|Мені сумно.
tired|I am {word}.|Я втомлена.
hungry|I am {word}.|Я голодна.
thirsty|I am {word}.|Я хочу пити.
ready|I am {word}.|Я готова.
sure|I am {word}.|Я впевнена.
hot|This tea is {word}.|Цей чай гарячий.
cold|This water is {word}.|Ця вода холодна.
easy|This question is {word}.|Це запитання легке.
difficult|This question is {word}.|Це запитання складне.
important|This question is {word}.|Це запитання важливе.
beautiful|This flower is {word}.|Ця квітка гарна.
interesting|This book is {word}.|Ця книжка цікава.
long|This road is {word}.|Ця дорога довга.
short|This story is {word}.|Ця історія коротка.
strong|I am {word}.|Я сильна.
young|I am {word}.|Я молода.
free|This ticket is {word}.|Цей квиток безкоштовний.
simple|This rule is {word}.|Це правило просте.
clear|This rule is {word}.|Це правило зрозуміле.
popular|This book is {word}.|Ця книжка популярна.
different|This book is {word}.|Ця книжка інша.
similar|These books are {word}.|Ці книжки подібні.
have|I {word} a book.|У мене є книжка.
eat|I {word} an apple.|Я їм яблуко.
drink|I {word} water.|Я п’ю воду.
read|I {word} a book.|Я читаю книжку.
write|I {word} a letter.|Я пишу листа.
go|I {word} home.|Я йду додому.
come|I {word} home.|Я приходжу додому.
see|I {word} a cat.|Я бачу кота.
like|I {word} apples.|Мені подобаються яблука.
love|I {word} my family.|Я люблю свою родину.
need|I {word} help.|Мені потрібна допомога.
want|I {word} some water.|Я хочу трохи води.
know|I {word} this word.|Я знаю це слово.
learn|I {word} English.|Я вивчаю англійську.
understand|I {word} this word.|Я розумію це слово.
speak|I {word} English.|Я розмовляю англійською.
say|I {word} hello.|Я кажу «привіт».
tell|I {word} a story.|Я розповідаю історію.
ask|I {word} a question.|Я ставлю запитання.
answer|I {word} a question.|Я відповідаю на запитання.
listen|I {word} to music.|Я слухаю музику.
watch|I {word} a film.|Я дивлюся фільм.
play|I {word} football.|Я граю у футбол.
walk|I {word} home.|Я йду додому пішки.
run|I {word} every day.|Я бігаю щодня.
swim|I {word} every day.|Я плаваю щодня.
sleep|I {word} at night.|Я сплю вночі.
wake up|I {word} early.|Я прокидаюся рано.
get up|I {word} early.|Я встаю рано.
buy|I {word} food.|Я купую їжу.
sell|I {word} books.|Я продаю книжки.
pay|I {word} for a ticket.|Я плачу за квиток.
take|I {word} a book.|Я беру книжку.
give|I {word} you a book.|Я даю тобі книжку.
bring|I {word} a book.|Я приношу книжку.
find|I {word} my bag.|Я знаходжу свою сумку.
use|I {word} a computer.|Я користуюся комп’ютером.
make|I {word} breakfast.|Я готую сніданок.
do|I {word} my homework.|Я роблю домашнє завдання.
think|I {word} about you.|Я думаю про тебе.
feel|I {word} happy.|Я почуваюся щасливою.
live|I {word} in Ukraine.|Я живу в Україні.
help|I {word} my friend.|Я допомагаю своєму другові.
open|I {word} the door.|Я відчиняю двері.
close|I {word} the door.|Я зачиняю двері.
start|I {word} a new book.|Я починаю нову книжку.
begin|I {word} a new book.|Я починаю нову книжку.
stop|I {word} here.|Я зупиняюся тут.
wait|I {word} here.|Я чекаю тут.
stay|I {word} here.|Я залишаюся тут.
sit|I {word} here.|Я сиджу тут.
stand|I {word} here.|Я стою тут.
move|I {word} slowly.|Я рухаюся повільно.
turn|I {word} left.|Я повертаю ліворуч.
look|I {word} at the sky.|Я дивлюся на небо.
hear|I {word} music.|Я чую музику.
remember|I {word} this word.|Я пам’ятаю це слово.
forget|I {word} this word.|Я забуваю це слово.
meet|I {word} my friend.|Я зустрічаю свого друга.
call|I {word} my friend.|Я телефоную своєму другові.
send|I {word} a letter.|Я надсилаю листа.
build|I {word} a house.|Я будую будинок.
grow|I {word} flowers.|Я вирощую квіти.
cut|I {word} the bread.|Я ріжу хліб.
try|I {word} again.|Я пробую знову.
change|I {word} my plan.|Я змінюю свій план.
keep|I {word} this book.|Я зберігаю цю книжку.
hold|I {word} a cup.|Я тримаю чашку.
put|I {word} the book here.|Я кладу книжку сюди.
leave|I {word} home.|Я виходжу з дому.
show|I {word} you a picture.|Я показую тобі малюнок.
believe|I {word} you.|Я вірю тобі.
offer|I {word} help.|Я пропоную допомогу.
expect|I {word} a letter.|Я очікую листа.
follow|I {word} this road.|Я йду цією дорогою.
continue|I {word} my work.|Я продовжую свою роботу.
create|I {word} a picture.|Я створюю малюнок.
add|I {word} some sugar.|Я додаю трохи цукру.
spend|I {word} time with you.|Я проводжу час із тобою.
win|I {word} the game.|Я виграю гру.
lose|I {word} the game.|Я програю гру.
reach|I {word} the station.|Я дістаюся до станції.
can|I {word} swim.|Я вмію плавати.
could|I {word} help you.|Я могла б тобі допомогти.
must|I {word} go home.|Я мушу йти додому.
should|I {word} go home.|Мені слід іти додому.
will|I {word} help you.|Я допоможу тобі.
would|I {word} like some tea.|Я хотіла б трохи чаю.
may|I {word} come tomorrow.|Можливо, я прийду завтра.
might|I {word} come tomorrow.|Можливо, я прийду завтра.
be|I want to {word} happy.|Я хочу бути щасливою.
become|I want to {word} a teacher.|Я хочу стати вчителькою.
in|The book is {word} my bag.|Книжка в моїй сумці.
on|The book is {word} the table.|Книжка на столі.
under|The cat is {word} the table.|Кіт під столом.
near|I live {word} the school.|Я живу біля школи.
and|I like tea {word} coffee.|Мені подобаються чай і кава.
but|I like tea, {word} I do not like coffee.|Мені подобається чай, але не подобається кава.
because|I eat {word} I am hungry.|Я їм, тому що голодна.
today|I am at home {word}.|Сьогодні я вдома.
tomorrow|I will come {word}.|Я прийду завтра.
Monday|I work on {word}.|Я працюю в понеділок.
Tuesday|I work on {word}.|Я працюю у вівторок.
Wednesday|I work on {word}.|Я працюю в середу.
Thursday|I work on {word}.|Я працюю в четвер.
Friday|I work on {word}.|Я працюю в п’ятницю.
Saturday|I rest on {word}.|Я відпочиваю в суботу.
Sunday|I rest on {word}.|Я відпочиваю в неділю.
`.trim().split('\n').map(row=>{const [word,pattern,uk,emoji='']=row.split('|');return [word.toLowerCase(),{pattern,uk,emoji}];}));

// Same spelling can have different meanings in the original dictionaries.
const lessonOverrides = {
  'nouns:work': {pattern:'I have some {word}.',uk:'У мене є трохи роботи.'},
  'verbs:work': {pattern:'I {word} at home.',uk:'Я працюю вдома.'},
  'verbs:help': {pattern:'I {word} my friend.',uk:'Я допомагаю своєму другові.'},
  'adjectives:open': {pattern:'The door is {word}.',uk:'Двері відчинені.'},
  'adjectives:close': {pattern:'My school is {word} to home.',uk:'Моя школа близько до дому.'}
};

// Familiar food patterns let the last step express a personal preference,
// including the plural form shown in the user's reference (I like bananas).
const lessonFoodForms={apple:'apples',banana:'bananas',orange:'oranges',egg:'eggs',tomato:'tomatoes',carrot:'carrots',strawberry:'strawberries',lemon:'lemons',potato:'potatoes',bread:'bread',milk:'milk',water:'water',tea:'tea',coffee:'coffee',rice:'rice',cheese:'cheese'};

function wordLesson(word){
  const key=word.en.toLowerCase();
  let entry=lessonOverrides[word.category+':'+key]||lessonExamples.get(key);
  if(key==='help'&&/допомога/.test(word.uk))entry={pattern:'I need {word}.',uk:'Мені потрібна допомога.'};
  if(key==='open'&&/відкрит/.test(word.uk))entry={pattern:'The door is {word}.',uk:'Двері відчинені.'};
  if(key==='work')entry=/працю/.test(word.uk)?{pattern:'I {word} at home.',uk:'Я працюю вдома.'}:{pattern:'I have some {word}.',uk:'У мене є трохи роботи.'};
  if(key==='orange'&&!/апельсин/.test(word.uk))entry={pattern:'This bag is {word}.',uk:'Ця сумка помаранчева.'};
  if(key==='like'&&!/подоба/.test(word.uk))entry=null;
  if(key==='close'&&/близьк/.test(word.uk))entry={pattern:'My school is {word} to home.',uk:'Моя школа близько до дому.'};
  const known=words.find(item=>item.category!=='custom'&&item.en.toLowerCase()===key&&item.uk===word.uk);
  if(word.category==='custom'&&!known)entry=null;
  entry=contextualLessons[word.id]||contextualLessons[known?.id]||entry;
  // New personal vocabulary can reuse an existing example. For a new entry,
  // use its supplied Ukrainian part of speech to choose a short construction.
  const meaning=word.uk.split(';')[0].trim(),first=meaning.split(' ')[0];
  const fallback=/(?:ти|тися)$/.test(first)
    ?{pattern:'I can {word}.',uk:`Я можу ${meaning}.`}
    :/(?:ий|ій)$/.test(first)
      ?{pattern:'It is {word}.',uk:`Це ${meaning}.`}
      :{pattern:/^(?:my|your|his|her|our|their|a|an|the|this|that) /i.test(word.en)?'Here is {word}.':'Here is the {word}.',uk:`Ось ${meaning}.`};
  const example=entry||fallback,[before,after]=example.pattern.split('{word}');
  const target=example.target||word.en;
  const sentence=before+target+after;
  const extra=(example.extra||[]).map(item=>({sentence:item.pattern.replace('{word}',item.target),translation:item.uk,target:item.target}));
  const alternative=/^I /.test(sentence)?sentence.replace(/^I am /,'You are ').replace(/^I was /,'You were ').replace(/^I /,'You '):'';
  const foodForm=entry&&lessonFoodForms[key]&&(key!=='orange'||/апельсин/.test(word.uk))?lessonFoodForms[key]:'';
  const preference=foodForm?`I like ${foodForm}.`:'';
  const forms=[...new Set([word.en,target,...extra.map(item=>item.target),foodForm].filter(Boolean))];
  const containsForm=sentence=>forms.some(form=>new RegExp('(^|[^\\p{L}\\p{N}])'+form.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'([^\\p{L}\\p{N}]|$)','iu').test(sentence));
  return {word,before,after,target,sentence,extra,translation:example.uk,emoji:example.emoji||'',quoted:false,
    forms,preference,foodForm,
    variants:[...new Set([sentence,...extra.map(item=>item.sentence),alternative,preference,preference.replace(/^I /,'You ')].filter(item=>item&&containsForm(item)))]};
}
