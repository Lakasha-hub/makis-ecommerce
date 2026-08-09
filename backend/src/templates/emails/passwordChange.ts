export const passwordChangeTemplate = (userName: string, resetLink: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #2c3e50; margin: 0;">Recuperación de Contraseña</h1>
      </div>
      
      <div style="padding: 20px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
        <p>Hola <strong>${userName}</strong>,</p>
        <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Si fuiste tú, haz clic en el siguiente botón para continuar:</p>
        
        <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
          <a href="${resetLink}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer mi contraseña</a>
        </div>

        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
          <a href="${resetLink}" style="color: #007bff; word-break: break-all;">${resetLink}</a>
        </p>

        <p style="font-size: 14px; color: #666; margin-top: 20px;">
          Si no solicitaste este cambio, por favor ignora este correo. Tu contraseña seguirá siendo la misma.
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
        <p>Makis E-commerce &copy; ${new Date().getFullYear()}</p>
      </div>
    </div>
  `;
};
