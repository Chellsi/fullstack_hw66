// Імітація бази даних користувачів
const users = [
    { id: '123', name: 'Іван Петренко', email: 'ivan@example.com', role: 'admin' },
    { id: '456', name: 'Марія Коваленко', email: 'maria@example.com', role: 'user' },
    { id: '789', name: 'Петро Сидоренко', email: 'petro@example.com', role: 'user' }
  ];
  
  // Отримати всіх користувачів (HTML сторінка)
  export const getUsersPage = (req, res) => {
    res.render('users/index', { 
      title: 'Список користувачів',
      users: users 
    });
  };
  
  // Отримати всіх користувачів (JSON для API)
  export const getUsersApi = (req, res) => {
    res.status(200).send('Get users route');
  };
  
  // Отримати користувача за ID (HTML сторінка)
  export const getUserByIdPage = (req, res) => {
    const { userId } = req.params;
    const selectedUser = users.find(u => u.id === userId);

    if (!selectedUser) {
      return res.status(404).render('error', {
        title: 'Помилка 404',
        message: 'Користувача не знайдено',
        error: { status: 404 }
      });
    }

    res.render('users/detail', {
      title: `Користувач: ${selectedUser.name}`,
      selectedUser
    });
  };
  
  // Отримати користувача за ID (JSON для API)
  export const getUserByIdApi = (req, res) => {
    const { userId } = req.params;
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).send('Not Found');
    }
    
    res.status(200).send(`Get user by Id route: ${userId}`);
  };
  
  // Створити користувача (API)
  export const createUser = (req, res) => {
    res.status(201).send('Post users route');
  };
  
  // Оновити користувача (API)
  export const updateUser = (req, res) => {
    const { userId } = req.params;
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).send('Not Found');
    }
    
    res.status(200).send(`Put user by Id route: ${userId}`);
  };
  
  // Видалити користувача (API)
  export const deleteUser = (req, res) => {
    const { userId } = req.params;
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).send('Not Found');
    }
    
    res.status(204).send();
  };