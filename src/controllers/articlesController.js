// Імітація бази даних статей
const articles = [
    { 
      id: '456', 
      title: 'Вступ до Node.js', 
      author: 'Іван Петренко',
      content: 'Node.js - це середовище виконання JavaScript, побудоване на движку Chrome V8. Воно дозволяє виконувати JavaScript на сервері.',
      date: '2025-01-15',
      views: 1250
    },
    { 
      id: '789', 
      title: 'Express.js для початківців', 
      author: 'Марія Коваленко',
      content: 'Express.js - це мінімалістичний та гнучкий веб-фреймворк для Node.js, який надає надійний набір функцій для веб-додатків.',
      date: '2025-01-20',
      views: 890
    },
    { 
      id: '101', 
      title: 'Шаблонізатори в Express', 
      author: 'Петро Сидоренко',
      content: 'Шаблонізатори дозволяють генерувати HTML динамічно, вставляючи дані в шаблони. PUG та EJS - популярні варіанти для Express.',
      date: '2025-01-25',
      views: 645
    }
  ];
  
  // Отримати всі статті (HTML сторінка)
  export const getArticlesPage = (req, res) => {
    res.render('articles/index.ejs', {
      title: 'Список статей',
      articles: articles 
    });
  };
  
  // Отримати всі статті (JSON для API)
  export const getArticlesApi = (req, res) => {
    res.status(200).send('Get articles route');
  };
  
  // Отримати статтю за ID (HTML сторінка)
  export const getArticleByIdPage = (req, res) => {
    const { articleId } = req.params;
    const article = articles.find(a => a.id === articleId);
    
    if (!article) {
      return res.status(404).render('error', { 
        title: 'Помилка 404',
        message: 'Статтю не знайдено',
        error: { status: 404 }
      });
    }
    
    res.render('articles/detail.ejs', {
      title: article.title,
      article: article 
    });
  };
  
  // Отримати статтю за ID (JSON для API)
  export const getArticleByIdApi = (req, res) => {
    const { articleId } = req.params;
    const article = articles.find(a => a.id === articleId);
    
    if (!article) {
      return res.status(404).send('Not Found');
    }
    
    res.status(200).send(`Get article by Id route: ${articleId}`);
  };
  
  // Створити статтю (API)
  export const createArticle = (req, res) => {
    res.status(201).send('Post articles route');
  };
  
  // Оновити статтю (API)
  export const updateArticle = (req, res) => {
    const { articleId } = req.params;
    const article = articles.find(a => a.id === articleId);
    
    if (!article) {
      return res.status(404).send('Not Found');
    }
    
    res.status(200).send(`Put article by Id route: ${articleId}`);
  };
  
  // Видалити статтю (API)
  export const deleteArticle = (req, res) => {
    const { articleId } = req.params;
    const article = articles.find(a => a.id === articleId);
    
    if (!article) {
      return res.status(404).send('Not Found');
    }
    
    res.status(204).send();
  };