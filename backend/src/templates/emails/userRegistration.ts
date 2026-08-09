export const userRegistrationTemplate = (userName: string): string => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #2c3e50; margin: 0;">¡Bienvenido a Makis!</h1>
      </div>
      
      <div style="padding: 20px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
        <p>Hola <strong>${userName}</strong>,</p>
        <p>Estamos muy felices de que te unas a nosotros. Tu cuenta ha sido creada exitosamente y ya puedes empezar a comprar y gestionar tus órdenes.</p>
        
        <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
          <a href="${frontendUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ir a la tienda</a>
        </div>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
        <p>Makis E-commerce &copy; ${new Date().getFullYear()}</p>
      </div>
    </div>
  `;
};
