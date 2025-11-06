// Встановлення теми через cookie
export const setTheme = (req, res) => {
    const { theme } = req.body;
  
    // Валідація теми
    const validThemes = ['light', 'dark'];
    if (!validThemes.includes(theme)) {
      return res.status(400).json({
        success: false,
        message: 'Невалідна тема. Дозволені: light, dark'
      });
    }
  
    // Збереження теми в cookie (30 днів)
    res.cookie('theme', theme, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
      httpOnly: false, // Дозволяємо JavaScript доступ для швидкої зміни
      sameSite: 'lax'
    });
  
    res.json({
      success: true,
      message: 'Тему змінено',
      theme
    });
  };
  
  // Отримання поточної теми
  export const getTheme = (req, res) => {
    const theme = req.cookies.theme || 'light';
    
    res.json({
      success: true,
      theme
    });
  };