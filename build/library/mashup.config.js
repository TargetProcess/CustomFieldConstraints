tau.mashups.addModule("CustomFieldConstraints/config", [
    {
        "processId": 14,
        "constraints": {
            "userstory": {
                "entityStates": [
                    {
                        "name": "Open",
                        "requiredCustomFields": [
                            "xText"
                        ]
                    }
                ],
                "customFields": [
                    {
                        "name": "Cf1",
                        "valueIn": [
                            "Cf1ValueThatRequiresCf2"
                        ],
                        "requiredCustomFields": [
                            "Cf2"
                        ]
                    }
                ]
            },
            "project": {
                "customFields": [
                    {
                        "name": "Cf1",
                        "valueNotIn": [
                            "Cf1ValueThatDoesNotRequireCf2"
                        ],
                        "requiredCustomFields": [
                            "Cf2"
                        ]
                    }
                ]
            }
        }
    }
]);