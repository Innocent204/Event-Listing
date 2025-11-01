<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Venue;
use Illuminate\Http\Request;

class VenueController extends Controller
{
    /**
     * Display a listing of venues.
     */
    public function index()
    {
        $venues = Venue::all();
        return response()->json($venues);
    }

    /**
     * Store a newly created venue.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'capacity' => 'nullable|integer',
        ]);

        $venue = Venue::create($request->all());
        return response()->json($venue, 201);
    }

    /**
     * Display the specified venue.
     */
    public function show(Venue $venue)
    {
        return response()->json($venue);
    }

    /**
     * Update the specified venue.
     */
    public function update(Request $request, Venue $venue)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'address' => 'sometimes|required|string',
            'latitude' => 'sometimes|required|numeric',
            'longitude' => 'sometimes|required|numeric',
            'capacity' => 'nullable|integer',
        ]);

        $venue->update($request->all());
        return response()->json($venue);
    }

    /**
     * Remove the specified venue.
     */
    public function destroy(Venue $venue)
    {
        $venue->delete();
        return response()->json(['message' => 'Venue deleted successfully']);
    }
}
