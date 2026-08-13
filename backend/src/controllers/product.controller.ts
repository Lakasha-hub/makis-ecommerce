import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
import { sendResponse } from '../utils/response';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

const productService = new ProductService();

export const getProducts = catchAsync(async (req: Request, res: Response) => {
  const { category, material } = req.query;
  const user = (req as any).user;
  const isAdmin = user?.role === 'admin';

  const products = await productService.getProducts(
    category as string | undefined,
    material as string | undefined,
    isAdmin
  );
  
  sendResponse(res, 200, products, 'Products fetched successfully');
});

export const getProductById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const product = await productService.getProductById(id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  sendResponse(res, 200, product, 'Product fetched successfully');
});

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const savedProduct = await productService.createProduct(req.body);
  sendResponse(res, 201, savedProduct, 'Product created successfully');
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const updatedProduct = await productService.updateProduct(id, req.body);

  if (!updatedProduct) {
    throw new AppError('Product not found', 404);
  }

  sendResponse(res, 200, updatedProduct, 'Product updated successfully');
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const deletedProduct = await productService.deleteProduct(id);

  if (!deletedProduct) {
    throw new AppError('Product not found', 404);
  }

  sendResponse(res, 200, deletedProduct, 'Product logically deleted');
});

export const updateVariantStock = catchAsync(async (req: Request, res: Response) => {
  const { id, variantId } = req.params;
  const { stock } = req.body;

  const product = await productService.updateVariantStock(id, variantId, stock);

  if (!product) {
    throw new AppError('Product or variant not found', 404);
  }

  sendResponse(res, 200, product, 'Variant stock updated successfully');
});
