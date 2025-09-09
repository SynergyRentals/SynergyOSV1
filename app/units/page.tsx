"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  Bed, 
  Bath, 
  Users, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

interface Unit {
  id: string;
  unitCode: string;
  unitName: string;
  bedrooms: number;
  bathrooms: number;
  sleeps: number;
  market: string;
  microMarket: string;
  active: boolean;
  healthScore: number;
  currentOccupancy: number;
  adr: number;
  issues: string[];
  tags: string[];
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([
    {
      id: "1",
      unitCode: "TG-001",
      unitName: "Tower Grove Loft",
      bedrooms: 1,
      bathrooms: 1,
      sleeps: 2,
      market: "St. Louis, MO",
      microMarket: "Tower Grove",
      active: true,
      healthScore: 85,
      currentOccupancy: 78,
      adr: 95,
      issues: [],
      tags: ["loft", "historic", "walkable"]
    },
    {
      id: "2", 
      unitCode: "SL-002",
      unitName: "Soulard Townhouse",
      bedrooms: 2,
      bathrooms: 2,
      sleeps: 4,
      market: "St. Louis, MO",
      microMarket: "Soulard",
      active: true,
      healthScore: 72,
      currentOccupancy: 65,
      adr: 120,
      issues: ["pricing_stale"],
      tags: ["townhouse", "historic", "brewery_district"]
    },
    {
      id: "3",
      unitCode: "CWE-003", 
      unitName: "Central West End Penthouse",
      bedrooms: 3,
      bathrooms: 2.5,
      sleeps: 6,
      market: "St. Louis, MO",
      microMarket: "Central West End",
      active: true,
      healthScore: 91,
      currentOccupancy: 82,
      adr: 180,
      issues: [],
      tags: ["penthouse", "luxury", "downtown"]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [marketFilter, setMarketFilter] = useState("all");
  const [bedroomFilter, setBedroomFilter] = useState("all");

  const filteredUnits = units.filter(unit => {
    const matchesSearch = unit.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.unitCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMarket = marketFilter === "all" || unit.microMarket === marketFilter;
    const matchesBedrooms = bedroomFilter === "all" || unit.bedrooms.toString() === bedroomFilter;
    
    return matchesSearch && matchesMarket && matchesBedrooms;
  });

  const getHealthScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Pass</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Warn</Badge>;
    return <Badge className="bg-red-100 text-red-800">Fail</Badge>;
  };

  const getOccupancyTrend = (occupancy: number) => {
    if (occupancy >= 75) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (occupancy >= 55) return <Clock className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getIssueChips = (issues: string[]) => {
    const issueLabels: Record<string, string> = {
      pricing_stale: "Pricing Stale",
      low_pacing: "Low Pacing", 
      ops_issue: "Ops Issue"
    };

    return issues.map(issue => (
      <Badge key={issue} variant="outline" className="text-xs">
        {issueLabels[issue] || issue}
      </Badge>
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Units</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your property portfolio
          </p>
        </div>
        <Button className="synergy-accent-bg text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Unit
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search units..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={marketFilter} onValueChange={setMarketFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Market" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Markets</SelectItem>
                <SelectItem value="Tower Grove">Tower Grove</SelectItem>
                <SelectItem value="Soulard">Soulard</SelectItem>
                <SelectItem value="Central West End">Central West End</SelectItem>
              </SelectContent>
            </Select>
            <Select value={bedroomFilter} onValueChange={setBedroomFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="1">1 BR</SelectItem>
                <SelectItem value="2">2 BR</SelectItem>
                <SelectItem value="3">3 BR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Units Table */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
          <CardDescription>
            {filteredUnits.length} of {units.length} units
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUnits.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{unit.unitCode}</div>
                      <div className="text-sm text-slate-500">{unit.unitName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <Bed className="h-3 w-3 mr-1" />
                        {unit.bedrooms}
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-3 w-3 mr-1" />
                        {unit.bathrooms}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {unit.sleeps}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1 text-slate-400" />
                      <span className="text-sm">{unit.microMarket}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {getOccupancyTrend(unit.currentOccupancy)}
                        <span className="text-sm">{unit.currentOccupancy}% occ</span>
                      </div>
                      <div className="text-sm text-slate-500">
                        ${unit.adr} ADR
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getHealthScoreBadge(unit.healthScore)}
                      <div className="text-xs text-slate-500">
                        {unit.healthScore}/100
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {unit.active ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {getIssueChips(unit.issues)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/units/${unit.id}`}>View</Link>
                      </Button>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82.7</div>
            <div className="text-xs text-slate-500">Average health score</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75.0%</div>
            <div className="text-xs text-slate-500">Portfolio average</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ADR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$131</div>
            <div className="text-xs text-slate-500">Portfolio average</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
