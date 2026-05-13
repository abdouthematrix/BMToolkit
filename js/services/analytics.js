// analytics.js - Firebase Analytics helpers

import { logEvent, setCurrentScreen } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { analytics } from '../firebase-config.js';

export class AnalyticsService {
    static trackPageView(route, title = document.title) {
        if (!analytics) return;

        setCurrentScreen(analytics, route);
        logEvent(analytics, 'page_view', {
            page_location: window.location.href,
            page_path: `#${route}`,
            page_title: title
        });
    }
}

