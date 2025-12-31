import { createFileRoute, Link } from "@tanstack/react-router";
import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import {
  Users,
  Building2,
  MessageSquare,
  Video,
  TrendingUp,
  ArrowUpRight,
  Loader2,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/layout/PageHeader";
import { useStats } from "../../hooks";
import type { StatsPeriod } from "../../schemas";

export const Route = createFileRoute("/_authenticated/")({
  component: DashboardPage,
});

const PERIOD_OPTIONS: { value: StatsPeriod; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

const CHART_COLORS = {
  users: "#34d399", // emerald
  companies: "#a78bfa", // violet
  videos: "#fbbf24", // amber
  questions: "#38bdf8", // sky
};

const ROLE_COLORS = {
  user: "#6b7280",
  admin: "#a78bfa",
  superadmin: "#fbbf24",
};

function DashboardPage() {
  const { user } = useUser();
  const [period, setPeriod] = useState<StatsPeriod>("30d");
  const { data: stats, isLoading } = useStats(period);

  // Format date for chart
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Build stats cards
  const statCards = [
    {
      label: "Total Users",
      value: stats?.totals.users ?? 0,
      periodChange: stats?.growth.users.total ?? 0,
      description: "Registered users",
      icon: Users,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
      href: "/users",
    },
    {
      label: "Organizations",
      value: stats?.totals.companies ?? 0,
      periodChange: stats?.growth.companies.total ?? 0,
      description: "Companies on platform",
      icon: Building2,
      color: "text-violet-400",
      bgColor: "bg-violet-400/10",
      href: "/companies",
    },
    {
      label: "Videos",
      value: stats?.totals.videos ?? 0,
      periodChange: stats?.growth.videos.total ?? 0,
      description: "Training content",
      icon: Video,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
      href: "/videos",
    },
    {
      label: "Questions",
      value: stats?.totals.questions ?? 0,
      periodChange: stats?.growth.questions.total ?? 0,
      description: "Quiz questions",
      icon: MessageSquare,
      color: "text-sky-400",
      bgColor: "bg-sky-400/10",
      href: "/videos",
    },
  ];

  // Build role breakdown for pie chart
  const roleData = stats?.roleBreakdown
    ? [
        { name: "Users", value: stats.roleBreakdown.user, color: ROLE_COLORS.user },
        { name: "Admins", value: stats.roleBreakdown.admin, color: ROLE_COLORS.admin },
        { name: "Superadmins", value: stats.roleBreakdown.superadmin, color: ROLE_COLORS.superadmin },
      ].filter((r) => r.value > 0)
    : [];

  // Build combined growth chart data
  const growthData =
    stats?.growth.users.data.map((point, idx) => ({
      date: formatDate(point.date),
      users: point.count,
      companies: stats.growth.companies.data[idx]?.count ?? 0,
      videos: stats.growth.videos.data[idx]?.count ?? 0,
      questions: stats.growth.questions.data[idx]?.count ?? 0,
    })) ?? [];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{name: string; value: number; color: string}>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-bg-elevated border border-border-default rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-text-primary mb-2">{label}</p>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-text-muted capitalize">{entry.name}:</span>
            <span className="text-text-primary font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <PageHeader
          title={`Welcome back, ${user?.firstName || "Admin"}!`}
          description="Platform analytics and growth metrics."
        />

        {/* Period Selector */}
        <div className="flex items-center gap-2 bg-bg-elevated rounded-lg p-1 border border-border-subtle">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                period === opt.value
                  ? "bg-accent text-text-inverse font-medium"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <Link key={index} to={stat.href} className="group">
            <Card
              variant="default"
              padding="lg"
              className="h-full hover:border-border-default transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm text-text-muted">{stat.label}</p>
                    <ArrowUpRight className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-3xl font-bold text-text-primary mt-1">
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
                    ) : (
                      stat.value.toLocaleString()
                    )}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {!isLoading && stat.periodChange > 0 && (
                      <span className="text-xs text-emerald-400 font-medium">
                        +{stat.periodChange}
                      </span>
                    )}
                    <span className="text-xs text-text-muted">
                      {stat.description}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Growth Chart */}
        <Card variant="default" padding="lg" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Growth Over Time
              </h2>
              <p className="text-sm text-text-muted">
                New registrations in the selected period
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <Calendar className="w-3 h-3" />
              <span>{PERIOD_OPTIONS.find((p) => p.value === period)?.label}</span>
            </div>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-text-muted" />
            </div>
          ) : growthData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.users} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.users} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCompanies" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.companies} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.companies} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke={CHART_COLORS.users}
                    strokeWidth={2}
                    fill="url(#colorUsers)"
                    name="Users"
                  />
                  <Area
                    type="monotone"
                    dataKey="companies"
                    stroke={CHART_COLORS.companies}
                    strokeWidth={2}
                    fill="url(#colorCompanies)"
                    name="Organizations"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-text-muted">
              <p>No growth data for this period</p>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border-subtle">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-sm text-text-muted">Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-violet-400" />
              <span className="text-sm text-text-muted">Organizations</span>
            </div>
          </div>
        </Card>

        {/* Role Distribution */}
        <Card variant="default" padding="lg">
          <h2 className="text-lg font-semibold text-text-primary mb-1">
            User Roles
          </h2>
          <p className="text-sm text-text-muted mb-4">Distribution by role</p>

          {isLoading ? (
            <div className="h-48 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-text-muted" />
            </div>
          ) : roleData.length > 0 ? (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {roleData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload as { name: string; value: number; color: string };
                        return (
                          <div className="bg-bg-elevated border border-border-default rounded-lg p-2 shadow-lg">
                            <div className="flex items-center gap-2 text-sm">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: data.color }}
                              />
                              <span className="text-text-primary">{data.name}</span>
                              <span className="font-medium text-text-primary">{data.value}</span>
                            </div>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Role Legend */}
              <div className="space-y-2 mt-4 pt-4 border-t border-border-subtle">
                {roleData.map((role, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: role.color }}
                      />
                      <span className="text-sm text-text-muted">{role.name}</span>
                    </div>
                    <span className="text-sm font-medium text-text-primary">
                      {role.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-text-muted">
              <p>No user data</p>
            </div>
          )}
        </Card>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Videos Chart */}
        <Card variant="default" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Content Growth
              </h2>
              <p className="text-sm text-text-muted">Videos & questions added</p>
            </div>
          </div>

          {isLoading ? (
            <div className="h-48 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-text-muted" />
            </div>
          ) : growthData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorVideos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.videos} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.videos} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.questions} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.questions} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="videos"
                    stroke={CHART_COLORS.videos}
                    strokeWidth={2}
                    fill="url(#colorVideos)"
                    name="Videos"
                  />
                  <Area
                    type="monotone"
                    dataKey="questions"
                    stroke={CHART_COLORS.questions}
                    strokeWidth={2}
                    fill="url(#colorQuestions)"
                    name="Questions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-text-muted">
              <p>No content data for this period</p>
            </div>
          )}

          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border-subtle">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-sm text-text-muted">Videos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-sky-400" />
              <span className="text-sm text-text-muted">Questions</span>
            </div>
          </div>
        </Card>

        {/* Summary Card */}
        <Card
          variant="default"
          padding="lg"
          className="bg-gradient-to-br from-accent/5 via-transparent to-violet-500/5 border-accent/20"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-lg bg-accent/10">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                Platform Summary
              </h3>
              <p className="text-sm text-text-muted">
                Overall growth and health
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-bg-elevated rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-bg-elevated/50 rounded-lg">
                <span className="text-sm text-text-muted">Total Organizations</span>
                <span className="text-lg font-bold text-text-primary">
                  {stats?.totals.companies.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-bg-elevated/50 rounded-lg">
                <span className="text-sm text-text-muted">Total Users</span>
                <span className="text-lg font-bold text-text-primary">
                  {stats?.totals.users.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-bg-elevated/50 rounded-lg">
                <span className="text-sm text-text-muted">Training Videos</span>
                <span className="text-lg font-bold text-text-primary">
                  {stats?.totals.videos.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-bg-elevated/50 rounded-lg">
                <span className="text-sm text-text-muted">Quiz Questions</span>
                <span className="text-lg font-bold text-text-primary">
                  {stats?.totals.questions.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-bg-elevated/50 rounded-lg">
                <span className="text-sm text-text-muted">Answer Options</span>
                <span className="text-lg font-bold text-text-primary">
                  {stats?.totals.answers.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
