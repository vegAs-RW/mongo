// use bookstore
db.createCollection('categories')
db.categories.insertMany([
    { name : "Programmation"},
    { name : "SQL"},
    { name : "NoSQL"}
])

db.createCollection('books')
db.books.insertMany([
    { title : "Python" },
   { title : "JS" }, 
   { title : "PosgreSQL" }, 
   { title : "MySQL" }, 
   { title : "MongoDB" }
])

// Faites un script JS afin d'associer chaque livre à sa catégorie en utilisant l'id de sa catégorie. Créez une propriété category_id dans la collection books.
const categories = db.categories.find({},{_id:1}).toArray();
console.log(categories);

db.books.updateOne(
    { title: "Python" },
    { $set: { category_id: categories[0]._id } }
  );
  
  db.books.updateOne(
    { title: "JS" },
    { $set: { category_id: categories[0]._id } }
  );
  
  db.books.updateOne(
    { title: "PosgreSQL" },
    { $set: { category_id: categories[1]._id } }
  );
  
  db.books.updateOne(
    { title: "MySQL" },
    { $set: { category_id: categories[1]._id } }
  );
  
  db.books.updateOne(
    { title: "MongoDB" },
    { $set: { category_id: categories[2]._id } }
  );

  // 2
  db.books.find(
    { category_id: db.categories.findOne(
        { name: "Programmation" })._id })

// 3
db.books.find(
    { category_id: db.categories.findOne(
        { name: "NoSQL" })._id }).count()

// 4
const newBooks = [
    { title : "Python & SQL"}, // programmation & SQL
    { title : "JS SQL ou NoSQL" }, // programmation
    { title : "Pandas & SQL & NoSQL"}, // SQL, NoSQL et programmation
    { title : "Modélisation des données"} // aucune catégorie
]

db.books.insertMany(newBooks)

db.books.updateOne(
    { title: "Python & SQL" },
    { $set: { category_id: [categories[0]._id, categories[1]._id] } }
  );
  
  db.books.updateOne(
    { title: "JS SQL ou NoSQL" },
    { $set: { category_id: [categories[0]._id] } }
  );
  
  db.books.updateOne(
    { title: "Pandas & SQL & NoSQL" },
    {
      $set: {
        category_id: [categories[0]._id, categories[1]._id, categories[2]._id],
      },
    }
  );
  
  db.books.updateOne(
    { title: "Modélisation des données" },
    { $unset: { category_id: "" } }
  );

  // 5
db.books.find({
    category_id: {$exists: false}
})

// 6
db.createCollection('categoriestree')
db.categoriestree.insertMany(
    [
        {
           _id: "Books",
           parent: null,
           name: "Informatique"
        },
        {
           _id: "Programming",
           parent: "Books",
           books: [
                 "Python apprendre",
                 "Pandas & Python",
                 "async/await JS & Python",
                 "JS paradigme objet",
                 "Anaconda"
           ]
        },
        {
           _id: "Database",
           parent: "Programming",
           books: [
                 "NoSQL & devenir expert avec la console",
                 "NoSQL drivers",
                 "SQL"
           ]
        },
        {
           _id: "MongoDB",
           parent: "Database",
           books: [
                 "Introduction à MongoDB",
                 "MongoDB aggrégation"
           ]
        }
     ]
)


db.categoriestree.find().forEach(function(doc) {
    db.categoriestree.updateOne(
       { _id: doc._id },
       {
          $addToSet: {
             ancestors: {
                $each: (() => {
                   const ancestors = [];
                   let parent = doc.parent;
                   while (parent !== null) {
                      const parentDoc = db.categoriestree.findOne({ _id: parent });
                      if (parentDoc) {
                         ancestors.push({ _id: parentDoc._id });
                         parent = parentDoc.parent;
                      } else {
                         parent = null;
                      }
                   }
 
                   return ancestors.reverse();
                })()
             }
          }
       }
    );
 });

