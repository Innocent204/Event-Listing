<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\VenueController;

// Authentication routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');
Route::put('/profile', [AuthController::class, 'updateProfile'])->middleware('auth:sanctum');
Route::post('/refresh', [AuthController::class, 'refresh'])->middleware('auth:sanctum');

// Event routes (protected) 
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/events', [EventController::class, 'index']);
    Route::post('/events', [EventController::class, 'store']);
    Route::get('/events/{event}', [EventController::class, 'show']);
    Route::put('/events/{event}', [EventController::class, 'update']);
    Route::delete('/events/{event}', [EventController::class, 'destroy']);
    Route::get('/events/calendar/{year}/{month}', [EventController::class, 'calendar']);
    Route::get('/my-events', [EventController::class, 'myEvents']);
    Route::post('/events/{event}/approve', [EventController::class, 'approve']);
    Route::post('/events/{event}/reject', [EventController::class, 'reject']);
});

// Category and Venue routes 
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/venues', [VenueController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    Route::post('/venues', [VenueController::class, 'store']);
    Route::get('/venues/{venue}', [VenueController::class, 'show']);
    Route::put('/venues/{venue}', [VenueController::class, 'update']);
    Route::delete('/venues/{venue}', [VenueController::class, 'destroy']);
});
